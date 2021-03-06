'use strict';

/**
* @ngdoc controller
* @name groupbuys.controller:GroupbuysController
*
* @requires $cope
* @requires $stateParams
* @requires $location
* @requires $translate
* @requires users.service:Authentication
* @requires users.service:Groupbuys
*
* @description
* Controlador encargado de la gestión de las Compras en Grupo.
*/

// Groupbuys controller
angular.module('groupbuys').controller('GroupbuysController', ['$scope','Restangular', '$stateParams', '$location', '$translate', 'Authentication', 'Groupbuys',
function($scope, Restangular, $stateParams, $location, $translate, Authentication, Groupbuys) {
	$scope.authentication = Authentication;

	//$locationProvider.html5Mode(true); // Mode HTML5

	// Configuration of tinyMCE
	$scope.tinymceOptions = {
		resize: false,
		menubar: false,
		statusbar: false,
		plugins: 'textcolor image table',
		toolbar1: 'bold italic underline strikethrough | forecolor backcolor fontsizeselect | removeformat',
		toolbar2: 'alignleft aligncenter alignright | bullist numlist outdent indent | table image'
	};


	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.loadList
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Gets the list of Groupbuys from the server and processes it.
	*/
	$scope.loadList = function(){
		var serverData = Restangular.all('groupbuys').getList();

		serverData.then(function(data) {

			// Add the real URL to the elements
			for (var i=0; i<data.length; i++) {
				data[i].restangularUrl = data[i].getRequestedUrl();
			}

			$scope.groupbuys = data;

		}, function errorCallback() {
	// TODO translate this key and don't use alert
			alert('Error getting data from server');
		});
	};

	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.loadMyList
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Gets the user list of Groupbuys from the server and processes it.
	*/
	$scope.loadMyList = function(){
		var serverData = Restangular.one('users',$scope.authentication.user._id).all('groupbuys').getList();

		serverData.then(function(data) {

			// Add the real URL to the elements
			for (var i=0; i<data.length; i++) {
				data[i].restangularUrl = data[i].getRequestedUrl();
			}

			$scope.groupbuys = data;

		}, function errorCallback() {
	// TODO translate this key and don't use alert
			alert('Error getting data from server');
		});
	};


	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.create
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Create new Groupbuy and redirects to the manage page
	*/
	$scope.create = function(isValid) {
		if (isValid) {

			var newGroupbuy = {};
			newGroupbuy.title = $scope.groupbuy.title;
			newGroupbuy.description = $scope.groupbuy.description;
			newGroupbuy.user = $scope.authentication.user._id;

			Restangular.all('groupbuys').post(newGroupbuy).then(function(serverResponse) {

			// Redirect after save
			// TODO parse and get Id
			$location.path('groupbuys');
			//	$location.path('groupbuys/' + response._id + '/manage');

			}, function(serverResponse) {
				// TODO parse and show errors
				console.log('Error sending data to server');
			});
		}
	};


	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.update
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Update existing Groupbuy
	*/
	$scope.update = function() {
		$scope.groupbuy.save();
	};

	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.loadOne
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Loads the groupbuy, userRole and tabs into the scope.
	*/
	$scope.loadOne = function() {

		var groupbuyData = Restangular.one('groupbuys',$stateParams.groupbuyId).get();

		groupbuyData.then(function(data) {
			$scope.groupbuy = data;

			$scope.userRole = $scope.userRole();
			$scope.loadTabs();

			$scope.loadConfig();

		}, function errorCallback() {
			// TODO translate this key and don't use alert
			alert('Error getting data from server');
		});


	};

	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.userRole
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Return the role ('manager', 'member', 'none') of the user in the groupbuy according to the url provided.
	*/
	$scope.userRole = function() {
		var role = 'none';
		var manage = false;

		// Not member users didn't receive other members list.
		if ( typeof $scope.groupbuy.members === 'undefined' ) {
			return 'none';
		}

		if ($scope.authentication && $scope.authentication.user) {
			var userId  = $scope.authentication.user._id;
			var fullUrl = $location.path().split('/');

			if (fullUrl[fullUrl.length - 1] === 'manage') {
				manage = true;
			}

			if ( $scope.groupbuy.members.length > 0 && $scope.groupbuy.members.indexOf(userId) !== -1 ) {
				role = 'member';
			}

			if ($scope.groupbuy.managers.length > 0 && $scope.groupbuy.managers.indexOf(userId) !== -1 ) {

				if (manage) {
					role = 'manager';
					$scope.authentication.user.memberCanAdmin = false;
				} else {
					// If it's manager but it's in member mode, set $scope.authentication.user.canAdmin to true
					$scope.authentication.user.memberCanAdmin = true;
				}

			}

			return role;
		} else {
			return null;
		}

	//	return 'none';
    //	return 'member';
	//	return 'manager';
	};


	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.loadTabs
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Loads the proper tabs in the scope based on the role of the user
	*/
	$scope.loadTabs =  function() {
		// Create the tabs menu according to the permissions of the user:
		$translate([
			'groupbuys.Information',
			'groupbuys.Items',
			'groupbuys.Members',
			'groupbuys.Requests',
			'groupbuys.Requests_summary',
			'groupbuys.Messaging',
			'groupbuys.Payments',
			'groupbuys.Deliveries',
			'groupbuys.Managers',
			'groupbuys.Configuration'
			]).then(function (translations) {
				switch ( $scope.userRole ){
					case 'manager':
						$scope.tabs = [
							{
								title: translations['groupbuys.Information'],
								template: '/modules/groupbuys/views/tabs/info-groupbuy.client.view.html',
								active: true
							},{
								title: translations['groupbuys.Items'],
								template:'/modules/groupbuys/views/tabs/items-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Members'],
								template:'/modules/groupbuys/views/tabs/members-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Requests'],
								template:'/modules/groupbuys/views/tabs/requests-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Messaging'],
								template:'/modules/groupbuys/views/tabs/messaging-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Payments'],
								template:'/modules/groupbuys/views/tabs/payments-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Deliveries'],
								template:'/modules/groupbuys/views/tabs/deliveries-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Managers'],
								template:'/modules/groupbuys/views/tabs/managers-groupbuy.client.view.html'
							},{
								title: translations['groupbuys.Configuration'],
								template:'/modules/groupbuys/views/tabs/config-groupbuy.client.view.html'
							}
						];
						break;
						case 'member':
							$scope.tabs = [
								{
									title: translations['groupbuys.Information'],
									template: '/modules/groupbuys/views/tabs/info-groupbuy.client.view.html',
									active: true
								},{
									title: translations['groupbuys.Items'],
									template:'/modules/groupbuys/views/tabs/items-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Members'],
									template:'/modules/groupbuys/views/tabs/members-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Messaging'],
									template:'/modules/groupbuys/views/tabs/messaging-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Payments'],
									template:'/modules/groupbuys/views/tabs/payments-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Deliveries'],
									template:'/modules/groupbuys/views/tabs/deliveries-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Managers'],
									template:'/modules/groupbuys/views/tabs/managers-groupbuy.client.view.html'
								}
							];
							break;
							default:
								$scope.tabs = [
								{
									title: translations['groupbuys.Information'],
									template: '/modules/groupbuys/views/tabs/info-groupbuy.client.view.html',
									active: true
								},{
									title: translations['groupbuys.Items'],
									template:'/modules/groupbuys/views/tabs/items-groupbuy.client.view.html'
								},{
									title: translations['groupbuys.Managers'],
									template:'/modules/groupbuys/views/tabs/managers-groupbuy.client.view.html'
								}
								];
								break;
				}
			});
	};


	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.toogleManage
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Toogles the manage or memeber view
	*/
	$scope.toogleManage = function() {
		var fullUrl = $location.path().split('/');
		if (fullUrl[fullUrl.length - 1] === 'manage') {
			// From manager to member
			$location.path('groupbuys/' + $scope.groupbuy._id );
		} else {
			// From member to manager
			$location.path('groupbuys/' + $scope.groupbuy._id + '/manage');

		}
	};

	// ----------------------

	/**
	* @ngdoc method
	* @name groupbuys.controller:GroupbuysController.$scope.remove
	* @methodOf groupbuys.controller:GroupbuysController
	*
	* @description
	* Remove existing Groupbuy
	*/
	$scope.remove = function(groupbuy) {
			$scope.groupbuy.remove().then(function () {
				$location.path('groupbuys');
			});
	};

	// ----------------------

	/*
    @ngdoc method
    * @name groupbuys.controller:GroupbuysController.findPosition
    * @methodOf groupbuys.controller:GroupbuysController

    @description
    * Finds the first appearance of an element that cointains an _id property with the value provided.
    * Otherwise returns -1
    */
    $scope.findPosition = function(value, list) {
        var position = -1;
        if (value !== '' && list !== '' ) {
            for (var i = 0 ; i < list.length ; i++){
                if (list[i]._id === value) {
                    position = i;
                    break;
                }
            }
        }
        return position;
    };

    // ----------------------

    /**
    * @ngdoc method
    * @name groupbuys.controller:GroupbuysController.loadConfig
    * @methodOf groupbuys.controller:GroupbuysController
    *
    * @description
    * Loads options of a Groupbuy.
    */
    $scope.loadConfig = function() {

		// Create payment elements
		$scope.payment = [];
		$scope.allPaymentData = [];

		// Create the visibility options list
		$scope.visibility = [];

        // members
        $scope.visibility.members_public = false;
        $scope.visibility.members_restricted = false;
        $scope.visibility.members_private = false;

        switch( $scope.groupbuy.visibility.members ) {
            case 'public':
                $scope.visibility.members_public = true;
                break;
            case 'restricted':
                $scope.visibility.members_restricted = true;
                break;
            case 'private':
                $scope.visibility.members_private = true;
                break;
            default:
        }

        // itemsByMember
        $scope.visibility.itemsByMember_public = false;
        $scope.visibility.itemsByMember_restricted = false;
        $scope.visibility.itemsByMember_private = false;

        switch( $scope.groupbuy.visibility.itemsByMember ) {
            case 'public':
                $scope.visibility.itemsByMember_public = true;
                break;
            case 'restricted':
                $scope.visibility.itemsByMember_restricted = true;
                break;
            case 'private':
                $scope.visibility.itemsByMember_private = true;
                break;
            default:
        }

        // paymentStatus
        $scope.visibility.paymentStatus_restricted = false;
        $scope.visibility.paymentStatus_private = false;

        switch( $scope.groupbuy.visibility.paymentStatus ) {
            case 'restricted':
                $scope.visibility.paymentStatus_restricted = true;
                break;
            case 'private':
                $scope.visibility.paymentStatus_private = true;
                break;
            default:
        }

        // shipmentsState
        $scope.visibility.shipmentsState_restricted = false;
        $scope.visibility.shipmentsState_private = false;

        switch( $scope.groupbuy.visibility.shipmentsState ) {
            case 'restricted':
                $scope.visibility.shipmentsState_restricted = true;
                break;
            case 'private':
                $scope.visibility.shipmentsState_private = true;
                break;
            default:
        }

		// Load groupbuy states

		$scope.groupbuy.allStatus = [];
		var statusesENG = ['new', 'published', 'acceptance', 'payments', 'paid', 'shipments', 'closed'];
		var statusesESP = ['Nueva', 'Publicada', 'Aceptación', 'Pagos', 'Pagada', 'Envios', 'Cerrada'];

		for (var i = 0 ; i < statusesENG.length ; i++){
			var elem = [];
			elem.name = statusesENG[i];
			elem.nombre = statusesESP[i];
			elem.btnClass = 'btn btn-link disabled';
			$scope.groupbuy.allStatus.push(elem);
		}

		// Mark current and next status
		for (var j = 0 ; j < $scope.groupbuy.allStatus.length ; j++){
			if ($scope.groupbuy.allStatus[j].name === $scope.groupbuy.status) {
				$scope.groupbuy.allStatus[j].btnClass = 'btn btn-default disabled active';
				if (j < $scope.groupbuy.allStatus.length-1) {
					// Avoid this in the last status
					$scope.groupbuy.allStatus[j+1].btnClass = 'btn btn-success';
				}
			}
		}

		// Special Status
		switch( $scope.groupbuy.status ) {
            case 'new':
			case 'published':
				$scope.groupbuy.showCancel = false;
				$scope.groupbuy.showDelete = true;
				break;
            case 'acceptance':
			case 'payments':
			case 'paid':
			case 'shipments':
			case 'closed':
				$scope.groupbuy.showCancel = true;
				$scope.groupbuy.showDelete = false;
				break;
			default:
                $scope.groupbuy.showCancel = false;
				$scope.groupbuy.showDelete = false;
        }

    };

	// ----------------------


// from the top of the file
}
]);
