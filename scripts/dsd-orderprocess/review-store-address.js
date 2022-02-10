// define([
//     "modules/jquery-mozu", 
//     "hyprlive", 
//     "modules/backbone-mozu",
//     'modules/cart-monitor',
//     'modules/models-cart',
//     'modules/api',
//     'dsd-orderprocess/review-cart'  
//     ],function ($, Hypr, Backbone, CartMonitor, CartModels,api,reviewCart) {	

//      var storeAdress = Backbone.MozuView.extend({
//             templateName: "modules/dsd-orderprocess/selected-store", 
//             getRenderContext: function () {
//                 var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
//                 //c.model.items[0].product.measurements.weight.value
//                     var cartItems = reviewCart.MiniCart.model.get('items').models;
//                     console.log(cartItems);
//                 // var items = c.model.items;
//                 // var itemLength = c.model.items.length;
//                 // var i;
//                 // var weight = 0;
//                 // for(i=0;i<itemLength;i++){
//                 //     weight += items[i].product.measurements.weight.value * items[i].quantity;
//                 // }
//                 // if(weight>0){
//                 //     c.model.totalWeight=weight;
//                 // }
//                 return c; 
//             },
//             render:function(){
//              //   console.log(this.model);
//                 Backbone.MozuView.prototype.render.call(this);
//             }
//         });
        
//     $(document).ready(function(){
//         var QOModel = Backbone.MozuModel.extend({});
//         var storeObj ={
//             storeAddress:function(){
//                 var accountId= require.mozuData('user').accountId;
//                 api.request('GET','api/commerce/customer/accounts/'+accountId).then(function(resp){
//                   var respAddress =resp.contacts[0];
//                   // var data = [ cartModel,respAddress];
//                     var storeadress = new storeAdress({
//                         el: $('#store-address'),
//                         model: new QOModel(respAddress)
//                     }); 
//                     storeadress.render(); 
//                 });
//             }
//         };
         
//         storeObj.storeAddress();
           
//         });

// });




















