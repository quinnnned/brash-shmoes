'use strict';

angular.module('brashShmoesApp')
  .factory('User', function ($resource) {
    return $resource('/api/users/:id/:controller', {
      id: '@_id'
    },
    {
      changePassword: {
        method: 'PUT',
        params: {
          controller:'password'
        }
      },
      get: {
        method: 'GET',
        params: {
          id:'me'
        }
      },
      getSuggestions: {
        method: 'GET',
        params: {
          id:'me',
          controller:'suggestions'
        }
      }
	  });
  });
