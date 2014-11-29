'use strict';

describe('Controller: IknowwhatudidCtrl', function () {

  // load the controller's module
  beforeEach(module('oneNightApp'));

  var IknowwhatudidCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    IknowwhatudidCtrl = $controller('IknowwhatudidCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
