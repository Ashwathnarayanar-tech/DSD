require(["modules/jquery-mozu", "underscore", "modules/api",
		"hyprlive", 'hyprlivecontext'], function ($, _, api, Hypr, HyprLiveContext) {
		    $(document).ready(function () {
		        api.request('get', '/api/commerce/customer/accounts/' + require.mozuData('user').accountId).then(function (resp) {
		            // you could display it a couple ways
		            $("<input  style='display:none' name='store-name' type='text' id='somevisiblefield' value='" + resp.contacts[0].firstName + "'>").insertAfter("#name");
		            $("<input  style='display:none' name='store-address' type='text' id='somevisiblefield' value='" + resp.contacts[0].address.address1 + "'>").insertAfter("#address1B");
		            $("<input  style='display:none' name='store-address2' type='text' id='somevisiblefield' value='" + resp.contacts[0].address.address2 + "'>").insertAfter("#address1C");
		            $("<input  style='display:none' name='store-city' type='text' id='somevisiblefield' value='" + resp.contacts[0].address.cityOrTown + ',&nbsp;' + resp.contacts[0].address.stateOrProvince + '&nbsp;' + resp.contacts[0].address.postalOrZipCode + "'>").insertAfter("#city");
		          //  $("<input type='text' id='somevisiblefield' value='" + resp.contacts[0].address.address1 + "'>").insertAfter("#address1A");
		            // or...
		           
		        //  $("<input type='hidden' id='somehiddenfield' value='" + resp.contacts[0].address.address1 + "'>").insertAfter("#address1B");
		           $("<label id='address1label'>" + resp.contacts[0].firstName + "</label>").insertAfter("#name");
		           $("<label id='address1label'>" + resp.contacts[0].address.address1 + "</label>").insertAfter("#address1B");
		           $("<label id='address1label'>" + resp.contacts[0].address.address2 + "</label>").insertAfter("#address1C");
		           $("<label id='address1label'>" + resp.contacts[0].address.cityOrTown + ',&nbsp;' + resp.contacts[0].address.stateOrProvince + '&nbsp;' + resp.contacts[0].address.postalOrZipCode + "</label>").insertAfter("#city");
		           // $("<label id='address1label'>" + resp.contacts[0].address.stateOrProvince + "</label>").insertAfter("#state");
		           // $("<label id='address1label'>" + resp.contacts[0].address.postalOrZipCode + "</label>").insertAfter("#zip");
		            console.log(resp);
		        });
		    });
		});