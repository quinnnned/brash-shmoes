'use strict'

var _ = require('lodash');

var makePairs = function(order) {
    var pairs = [];
  
    for (var i=0; i<order.length-1;i++) {
        for (var j=i+1; j<order.length;j++) {
            pairs.push([order[i],order[j]]);
        }    
    }
    return pairs;
};

var genMap = function(voterRankings) {
    var map = {},
        invMap = [];
        
    voterRankings.forEach(function(order){
        order.forEach(function(id){
           if (map[id] == null) {
               map[id] = invMap.length;
               invMap.push(id);
           } 
        });
    });
    
    return {
        forward: map,
        reverse: invMap
    };
    
};

var getOrderByShufflingValues = function(counts) {
    var swap = function(a,i,j) {
        var temp = a[i];
        a[i] = a[j];
        a[j] = temp;
    };    
    
    var N = counts.length;
    var order = _.range(N);
    var pairs = makePairs(order);
    var unsorted = true; 
    while (unsorted) {
        unsorted = false;
        pairs.forEach(function(pair){
            var i = pair[0];
            var j = pair[1];
            if (counts[i] < counts[j]) {
                unsorted = unsorted || true;
                swap(counts,i,j);
                swap(order,i,j);
            }
        });
    }
    return order;
}

exports.LinearWeighting = function(voterRankings) {
    var mapping = genMap(voterRankings),
        map = mapping.forward,
        invMap = mapping.reverse,
        N = invMap.length;
    
    var votes = [];
    voterRankings.forEach(function(ranking){
       ranking.forEach(function(candidate, index) {
           var i = map[candidate];
           votes[i] = votes[i] || 0;
           votes[i] -= index;
       }); 
    });
    
    return getOrderByShufflingValues(votes).map(function(x){ 
        return invMap[x];
    });
};

exports.Schulze = function(voterRankings) {
    var mapping = genMap(voterRankings),
        map = mapping.forward,
        invMap = mapping.reverse,
        N = invMap.length;
    
    var genSquareMatrix = function(n) {
        var mat = new Array(n);
        for (var i=0;i<mat.length;i++) mat[i] = new Array(n);
        return mat;
    };
    
    var computePairwisePreferenceMatrix = function() {
        var d = genSquareMatrix(N);
        voterRankings.forEach(function(ranking){
            makePairs(ranking).forEach(function(pair){
                var i = map[pair[0]],
                    j = map[pair[1]];
                d[i][j] = d[i][j] ? d[i][j] + 1 : 1;
            });
        });
        
        return d;
    };
    
    var computeStrongestPaths = function(d) {
        var N = d.length;
        var p = genSquareMatrix(N);
        
        for (var i=0;i<N;i++) {
            for (var j=0;j<N;j++) {
                if (i===j) continue;
                p[i][j] = ( d[i][j] > d[j][i] ) ? d[i][j] : 0;
            }    
        }
        
        for (var i=0;i<N;i++) {
            for (var j=0;j<N;j++) {
                if (i===j) continue;
                for (var k=0;k<N;k++) {
                    if (k===i) continue;
                    if (k===j) continue;
                    p[j][k] = Math.max(p[j][k],Math.min(p[j][i],p[i][k]));  
                }
            }    
        }
        
        return p;
    };
    
    var computeIdealOrder = function(p) {
        var N = p.length;
        var counts = new Array(N);
        for (var i=0;i<N;i++) {
            counts[i] = 0;
            for (var j=0;j<N;j++) {
                if (i===j) continue;
                if (p[i][j] > p[j][i]) counts[i]++;
            }    
        }
      
        
        var order = getOrderByShufflingValues(counts);
     
        return order.map(function(x){
            return invMap[x];
        });
    };
    
    // Computation:
    genMap();
    return  computeIdealOrder(
                computeStrongestPaths(
                    computePairwisePreferenceMatrix()));
};