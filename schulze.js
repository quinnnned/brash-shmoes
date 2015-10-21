
var _ = require('lodash');


var multiAddArray = function(master, a, n) {

    for (var i=0;i<n;i++)   {
        master.push(_.cloneDeep(a));
    }
};




var a=5,b=4,c=3,d=2,e=1,allSuggestions = [];
multiAddArray(allSuggestions, [a,c,b,e,d], 5);
multiAddArray(allSuggestions, [a,d,e,c,b], 5);
multiAddArray(allSuggestions, [b,e,d,a,c], 8);
multiAddArray(allSuggestions, [c,a,b,e,d], 3);
multiAddArray(allSuggestions, [c,a,e,b,d], 7);
multiAddArray(allSuggestions, [c,b,a,d,e], 2);
multiAddArray(allSuggestions, [d,c,e,b,a], 7);
multiAddArray(allSuggestions, [e,b,a,d,c], 8);




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

var getLinearWeightOrdering = function(voterRankings) {
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

var getSchulzeOrdering = function(voterRankings) {
    
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




console.log(getLinearWeightOrdering([ 
    [ 1,2,3,4,5,6 ],
    [ 1,2,6,4,5,3 ]
]));
