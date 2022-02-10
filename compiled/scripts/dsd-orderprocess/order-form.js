require([
    "modules/jquery-mozu",
    "underscore",
    "modules/api",
    "hyprlive", 
    "modules/backbone-mozu",
    'modules/models-cart',"vendor/jquery-ui.min"], 
     function ($,_, api, Hypr, Backbone,CartModels) {
      var storeAdress = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/order-address", 
            
             additionalEvents: {
				"click .printpage": "printelement",
				"click .remove-item-list": "closemodel"
            },
			closemodel:function(e){
				$('.print-modal').hide(); 
			},
      
        printelement: function(e){
            
            var myhtml = $('.orderformprint').html();
            var printWin = window.open();
            var styles="<style>button{display:none},.printclose{display:none},.print-modal{display:none;position:fixed;font-family:Arial,Helvetica,sans-serif;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.8);z-index:99999;-webkit-transition:opacity .4s ease-in;-moz-transition:opacity .4s ease-in;transition:opacity .4s ease-in}.panel .mzprintcate,.print-modal .printtext{font-weight:700;font-family:Trebuchet MS,sans-serif}.print-modal .cart-container{width:70%;background:#fff;margin:0 auto;position:absolute;top:8%;left:11%;height:550px;overflow-y:scroll}.print-modal .cart-container .cart-content{padding:8%}.print-modal .cart-container .cart-content .cart-message{padding:0 0 4%;font-size:18px;text-align:center;color:#000}.print-modal .cart-container .cart-content .cart-btns{text-align:center}.print-modal .cart-container .cart-content .cart-btns .btn-no{padding:3% 12%;background:#999;border:none;color:#fff;margin:0 2% 0 0;font-size:15px}.print-modal .cart-container .cart-content .cart-btns .btn-yes{padding:3% 12%;background:#0080b7;color:#fff;border:none;margin:0 0 0 2%;font-size:15px}.print-modal .printtext{text-align:center;font-size:17px;color:#000;border-bottom:1px solid #ccc;padding-bottom:15px;margin:20px}.print-modal .printclose{position:absolute;top:0;right:0;background:#0080b7;color:#fff;padding:20px;width:10px;height:10px;border-radius:50px;font-size:19px}.print-modal .printclose .remove-item-list{position:relative;top:-7px;left:-4px}.print-modal .border{border-top:1px solid #CCB;height:12px}.print-modal .store-address{margin-bottom:10px;padding:15px 30px}.print-modal .printbtn button{background:#f47c20;background:-webkit-gradient(linear,left top,left bottom,from(#f88e11),to(#f06015));background:-moz-linear-gradient(top,#f88e11,#f06015);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f88e11', endColorstr='#f06015');color:#fff;padding:10px 25px;border:0;float:right;margin:1% 2% 0 0}.panel,.panel{clear:both;margin:20px}.panel .mzprintcate{font-size:17px;text-transform:uppercase}.panel ul{padding:0}.panel ul li{display:inline-block;clear:right;text-align:left;width:44%;vertical-align:top;font-size:13px;text-transform:uppercase;margin:6px 0}.panel ul .printdash{width: 3.5%;margin-right:5px}.panel:last-child{border-bottom:none}.printclose{visibility: hidden;}svg{  display:inline-block; padding: 0px 10px;}</style>";
            printWin.document.write('<html><head>'+styles+'</head><body><div class="cart-container">'+myhtml+'</div></body></html>');
            printWin.document.close();
            printWin.focus();
            printWin.print();
            if($(window).width()>1024){
                printWin.close();
            }
        },
        getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
               
                return c; 
        },
        render:function(){
             //   console.log(this.model);
                Backbone.MozuView.prototype.render.call(this);
            }
            
        });
        
    $(document).ready(function(){
        $(document).on('click', function (e) { 
            var target = $(e.target)[0];
            if($(target).attr('class')){
            if($(target).attr('class').split(' ')[0] == "print-modal"){
                $('.print-modal').removeClass('display-block'); 
                $('.print-modal').hide();
                }
            }
        });
        var QOModel = Backbone.MozuModel.extend({});
        var storeObj ={
            storeAddress:function(){
                var accountId= require.mozuData('user').accountId;
                api.request('GET','api/commerce/customer/accounts/'+accountId).then(function(resp){
                  var respAddress =resp.contacts[0];
                  // var data = [ cartModel,respAddress];
                    var storeadress = new storeAdress({
                        el: $('.printorder'),
                        model: new QOModel(respAddress)
                    }); 
                    storeadress.render(); 
                });
            }
        };
         
        storeObj.storeAddress();
    
        });
        
        $('.printpage').click(function(){
              
            var myhtml = $('.orderformprint').html();
            var printWin = window.open();
           // var styles="<style>button{display:none},.printclose{display:none},.print-modal{display:none;position:fixed;font-family:Arial,Helvetica,sans-serif;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.8);z-index:99999;-webkit-transition:opacity .4s ease-in;-moz-transition:opacity .4s ease-in;transition:opacity .4s ease-in}.panel .mzprintcate,.print-modal .printtext{font-weight:700;font-family:Trebuchet MS,sans-serif}.print-modal .cart-container{width:70%;background:#fff;margin:0 auto;position:absolute;top:8%;left:11%;height:550px;overflow-y:scroll}.print-modal .cart-container .cart-content{padding:8%}.print-modal .cart-container .cart-content .cart-message{padding:0 0 4%;font-size:18px;text-align:center;color:#000}.print-modal .cart-container .cart-content .cart-btns{text-align:center}.print-modal .cart-container .cart-content .cart-btns .btn-no{padding:3% 12%;background:#999;border:none;color:#fff;margin:0 2% 0 0;font-size:15px}.print-modal .cart-container .cart-content .cart-btns .btn-yes{padding:3% 12%;background:#0080b7;color:#fff;border:none;margin:0 0 0 2%;font-size:15px}.print-modal .printtext{text-align:center;font-size:17px;color:#000;border-bottom:1px solid #ccc;padding-bottom:15px;margin:px}.print-modal .printclose{position:absolute;top:0;right:0;background:#0080b7;color:#fff;padding:20px;width:10px;height:10px;border-radius:50px;font-size:19px}.print-modal .printclose .remove-item-list{position:relative;top:-7px;left:-4px}.print-modal .border{border-top:1px solid #CCB;height:12px}.print-modal .store-address{margin-bottom:10px;padding:15px 30px}.print-modal .printbtn button{background:#f47c20;background:-webkit-gradient(linear,left top,left bottom,from(#f88e11),to(#f06015));background:-moz-linear-gradient(top,#f88e11,#f06015);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f88e11', endColorstr='#f06015');color:#fff;padding:10px 25px;border:0;float:right;margin:1% 2% 0 0}.panel,.panel .enternumber{display: inline-block;width: 35px;height: 1px;background: #cccccc;}.panel{clear:both;margin:20px}.panel .mzprintcate{font-size:17px;text-transform:uppercase}.panel ul{padding:0}.panel ul li{display:inline-block;clear:right;text-align:left;width:44%;vertical-align:top;font-size:13px;text-transform:uppercase;margin:6px 0}.panel ul .printdash{width:25px;margin-right:5px}.panel:last-child{border-bottom:none}.printclose{visibility: hidden;:}svg{  display:inline-block; padding: 0px 10px;}</style>";
             var styles="<style>button{display:none},.printclose{display:none},.print-modal{display:none;position:fixed;font-family:Arial,Helvetica,sans-serif;top:0;right:0;bottom:0;left:0;background:rgba(0,0,0,.8);z-index:99999;-webkit-transition:opacity .4s ease-in;-moz-transition:opacity .4s ease-in;transition:opacity .4s ease-in}.panel .mzprintcate,.print-modal .printtext{font-weight:700;font-family:Trebuchet MS,sans-serif}.print-modal .cart-container{width:70%;background:#fff;margin:0 auto;position:absolute;top:8%;left:11%;height:550px;overflow-y:scroll}.print-modal .cart-container .cart-content{padding:8%}.print-modal .cart-container .cart-content .cart-message{padding:0 0 4%;font-size:18px;text-align:center;color:#000}.print-modal .cart-container .cart-content .cart-btns{text-align:center}.print-modal .cart-container .cart-content .cart-btns .btn-no{padding:3% 12%;background:#999;border:none;color:#fff;margin:0 2% 0 0;font-size:15px}.print-modal .cart-container .cart-content .cart-btns .btn-yes{padding:3% 12%;background:#0080b7;color:#fff;border:none;margin:0 0 0 2%;font-size:15px}.print-modal .printtext{text-align:center;font-size:17px;color:#000;border-bottom:1px solid #ccc;padding-bottom:15px;margin:20px}.print-modal .printclose{position:absolute;top:0;right:0;background:#0080b7;color:#fff;padding:20px;width:10px;height:10px;border-radius:50px;font-size:19px}.print-modal .printclose .remove-item-list{position:relative;top:-7px;left:-4px}.print-modal .border{border-top:1px solid #CCB;height:12px}.print-modal .store-address{margin-bottom:10px;padding:15px 30px}.print-modal .printbtn button{background:#f47c20;background:-webkit-gradient(linear,left top,left bottom,from(#f88e11),to(#f06015));background:-moz-linear-gradient(top,#f88e11,#f06015);filter:progid:DXImageTransform.Microsoft.gradient(startColorstr='#f88e11', endColorstr='#f06015');color:#fff;padding:10px 25px;border:0;float:right;margin:1% 2% 0 0}.panel,.panel{clear:both;margin:20px}.panel .mzprintcate{font-size:17px;text-transform:uppercase}.panel ul{padding:0}.panel ul li{display:inline-block;clear:right;text-align:left;width:44%;vertical-align:top;font-size:13px;text-transform:uppercase;margin:6px 0}.panel ul .printdash{width:3.5%;margin-right:5px}.panel:last-child{border-bottom:none}.printclose{visibility: hidden;}svg{  display:inline-block; padding: 0px 10px;}</style>";
            printWin.document.write('<html><head>'+styles+'</head><body><div class="cart-container">'+myhtml+'</div></body></html>');
            printWin.document.close();
            printWin.focus();
            printWin.print();
            if($(window).width()>1024){
                printWin.close();
            }
            
        });

});













