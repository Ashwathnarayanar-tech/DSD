define([
    "modules/jquery-mozu", "underscore",
    "hyprlive", 
    "modules/backbone-mozu",
    'modules/models-cart','modules/api', 'modules/models-product' ,'dsd-orderprocess/reviewandplaceorder'
    ],function ($,_, Hypr, Backbone, CartModels,api, ProductModels,placeorder) {
           
        var MiniCartView = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/reviewyourorder",
            additionalEvents: {
                "click .remove-item": "removeItem", 
                "change .qty select":"updateQty",
                "click .clear-cart a": "clearCart",
                "click .checkout-button.disabled": "notifyOrderAmount"
            },
            getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments),self = this;
                //c.model.items[0].product.measurements.weight.value
                var items = c.model.items,itemLength = c.model.items.length,i,weight = 0; 
                for(i=0;i<itemLength;i++){
                    weight += items[i].product.measurements.weight.value * items[i].quantity;
                }
                if(weight>0){
                    c.model.totalWeight=weight;
                }

                // Progress bar
                if(c.model.total > 0){
                    $(document).find('.progress-bar').show();
                    setTimeout(function(){self.progressbar(c.model.total);},1000);                    
                }else{
                    setTimeout(function(){self.progressbar(c.model.total);$(document).find('.progress-bar').hide();},1000);                       
                }
                
                
                $( window ).on( "orientationchange", function( event ) {
                    $(document).find('.progress-bar').show();
                    setTimeout(function(){self.progressbar(c.model.total);},500);                    
                });
                
                //future date
                if(c.model.items.length>0 && window.futureDates !== null && this.model.get('items').length === window.cartItems){
                    var res = this.updateFutureDates(window.futureDates,c.model);
                    window.cartItems = c.model.items.length;
                    c.model.futureDates = res.futureDate;
                }    
                return c;
            },
            progressbar: function(total){
                $(document).find(".meter").find("span").each(function() {
                    var currentWidth = $(this).width();
                    var per = total * 100/Hypr.getThemeSetting('minimumOrderAmount');
                    per = Math.floor(per).toFixed(0);  
                    window.progressBar = false;
                    if(per < 100){     
                        $(document).find('.progress-bar').show(); 
                        $(document).find('.progress-bar').css("visibility","visible");
                        $(this).css('width',per+"%");                      
                        $(this)
                            .data("origWidth", $(this).width())
                            .width(currentWidth)
                            .animate({
                                width: $(this).data("origWidth") 
                            }, 1200);  
                            $(document).find('.meter').removeClass('green');   
                            if(!$(document).find('.meter').hasClass('blue')){
                                $(document).find('.meter').addClass('blue');
                            }    
                            if(per > 0){
                                $(document).find('.mz-pageheader').addClass('onProgressBar'); 
                                $(document).find('.text-content').html("<strong>"+per+"% complete.</strong> Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" more to meet the Minimum Order Requirement!");
                                if($(window).width() <= 767){           
                                    $(document).find('.text-content').html("Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" to place your order.");  
                                }      
                            }else{      
                                $(document).find('.mz-pageheader').removeClass('onProgressBar');
                                $(document).find('.progress-bar').hide();
                                $(document).find('.progress-bar').css("visibility","hidden");
                                $(document).find('.text-content').html("<strong>"+per+"% complete.</strong> Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" more to meet the Minimum Order Requirement!");
                                if($(window).width() <= 767){
                                    $(document).find('.text-content').html("Add $"+(Hypr.getThemeSetting('minimumOrderAmount')-total).toFixed(2)+" to place your order.");  
                                } 
                            }    
                    }else{ 
                        $(document).find('.progress-bar').show();
                        $(document).find('.mz-pageheader').addClass('onProgressBar'); 
                        $(document).find('.progress-bar').css("visibility","visible");
                        $(this).css('width',"100%");
                        $(this)
                            .data("origWidth", $(this).width())
                            .width(currentWidth)
                            .animate({
                                width: $(this).data("origWidth")
                            }, 1200); 
                            $(document).find('.meter').removeClass('blue');
                            if(!$(document).find('.meter').hasClass('green')){
                                $(document).find('.meter').addClass('green');   
                            }                           
                            $(document).find('.text-content').html("<strong>Congratulations,</strong> you have hit the Minimum Order Requirement!");
                            if($(window).width() <= 767){
                                $(document).find('.text-content').html("<strong>Congratulations,</strong> you have hit the Minimum Order Requirement!");
                            } 
                    }    
                }); 
            }, 
            clearCart: function() {
                var self = this;
                $("body").find(".overlay-right-side").show();
              $('.cart-modal').show();
                $('.cart-btns button').on('click',function(){
                    if($(this).text().toLowerCase() === "yes"){
                        self.model.apiDel().then(function() {
                        //window.location.reload();
                        //this.render();
                        self.updateReviewCart();
                        $.removeCookie('oosProducts');
                    });
                    }else{
                        $('.cart-modal').hide();
                        $("body").find(".overlay-right-side").hide();
                    }
                });
            }, 
            removeItem:function(e){
                $("body").find(".overlay-right-side").show();
                var id= $(e.currentTarget).attr('data-mz-productid'); 
                this.model.removeItem(id);
                var pCode = $(e.currentTarget).attr('pcode').trim();
                /*if(!$('.place-order').is(':hidden')){
                    $('.place-order').slideUp('slow');
                    $('.order-body').slideDown('slow');
                     $('.dsdcheckoutheader .editchange').hide(function(){
                        $('.dsdcheckoutheader .collapsed').show();
                    });
                   
                }*/
                if($.cookie('oosProducts')){
                    var oosProducts  = JSON.parse($.cookie("oosProducts")).filter(function(i){
                        return(i.productcode !== pCode); 
                    }); 
                    $.cookie("oosProducts",JSON.stringify(oosProducts));
                    return false;
                }
            },
            updateQty:function(e){
                $("body").find(".overlay-right-side").show();
                var self=this;
                var current = e;
                var qty= $(e.currentTarget).val();
                var currentId = $(e.currentTarget).attr('data-mz-productid');
                var items = self.model.get('items').models;
                var itemsLength = self.model.get('items').models.length;
                var i; 
                for(i=0;i<itemsLength;i++){
                   if(items[i].id === currentId){
                       items[i].set('quantity',qty);
                       items[i].saveQuantity();
                      
                       break;
                   }
                }
                /*  if(!$('.place-order').is(':hidden')){
                    $('.place-order').slideUp('slow');
                    $('.order-body').slideDown('slow');
                    $('.dsdcheckoutheader .editchange').hide(function(){
                        $('.dsdcheckoutheader .collapsed').show();
                    });
                   
                }*/
                api.on('error', function (badPromise, xhr, requestConf) {
                    $("body").find(".overlay-right-side").hide();
                    api.get('product', $(e.currentTarget).attr('data-mz-productcode')).then(function(productDetails) { 
                        var stockavaillabel = (productDetails.data.inventoryInfo.manageStock) ? productDetails.data.inventoryInfo.onlineStockAvailable : 4;
                        $.each($(e.currentTarget).children('option'),function(i,v){
                            if($(v).attr('selected')){ 
                                if( $(v).parents("tr").hasClass("mobile")) 
                                    $(v).parents("tr").prev().find('.desc .cart-error').html("Only "+stockavaillabel+" in stock.");
                                else
                                    $(v).parents("tr").find('.desc .cart-error').html("Only "+stockavaillabel+" in stock.");     
                                
                                $(v).prop('selected','selected');
                                 $(e.currentTarget).children("option:gt("+ (stockavaillabel-1) +")").remove(); 
                                return false; 
                            }
                        }); 
                    });
                });
            },
            updateReviewCart:function(){
                cartModel.apiGet();
            },
            
            notifyOrderAmount: function(e){
                e.preventDefault();
                $('.cart-modal').show();
                $('.cart-modal').find('.cart-container:last-child').addClass('notify-order-amt');
                $('.cart-btns .btn-no').on('click', function(e){
                    $('.cart-modal').hide();
                    $('.cart-modal').find('.cart-container:last-child').removeClass('notify-order-amt');
                });
                return false;
            },
            checkInventory:function(){
				if(this.model.get('items').models.length>0){
                    var filter = "",prodArray = [], oosItems = [],count=0;
                    $.each(this.model.get('items').models,function(i,v){
                        if(i > 0)
                            filter+= ' or ';   
                        filter+= 'productCode+eq+'+v.get('product.productCode');
                        var p = {
                            productcode:v.get('product.productCode'),
                            qty:v.get('quantity')
                        };
                        prodArray.push(p);
                    });
                    api.request('GET','api/commerce/catalog/storefront/products/?filter='+filter+' &pageSize=100').then(function(res){
                        $.each(res.items,function(i,v){
                            var product = _.find(prodArray, function(c) {
                                return c.productcode == v.productCode ;
                            });
                            if(v.inventoryInfo.manageStock && v.inventoryInfo.onlineStockAvailable < product.qty  ){
                                count++;
                                if($(window).width()>1024){
                                    $(document).find('[cart-prod-code="'+v.productCode+'"]').text(Hypr.getLabel('qtynotavailabel'));  
    								oosItems.push(product);
                                }else{
                                    $(document).find('[mob-cart-prod-code="'+v.productCode+'"]').text(Hypr.getLabel('qtynotavailabel'));
    								oosItems.push(product);
                                }  
                            }
                        });
                        if( $.cookie("oosProducts")){
                            $.cookie("oosProducts",JSON.stringify(JSON.parse($.cookie("oosProducts")).concat(oosItems)));
                        }else{
                            $.cookie("oosProducts",JSON.stringify(oosItems));
                        }
                        window.oosCheck = false;
                        if(count>0){
                           $(document).find('.oos-error-msg').text(Hypr.getLabel('ooserror')); 
                        }
                    });   
				}
            },
            outOfStockMessage:function(){
                $.each(JSON.parse($.cookie('oosProducts')),function(i,v){
                    if($(window).width()>1024){
                        $(document).find('[cart-prod-code="'+v.productcode+'"]').text(Hypr.getLabel('qtynotavailabel'));  
                    }else{
                        $(document).find('[mob-cart-prod-code="'+v.productcode+'"]').text(Hypr.getLabel('qtynotavailabel'));
                    }  
                });
            },
            getDates:function(){
                var self = this;
                if(this.model.get('items').length>0 && this.model.get('items').length !== window.cartItems){
                    this.getProductDates(this.model);
                    
                    // this.model.set("futureDates","fufuufu");
                    // this.render();
                }
            },
            callback:function(res){
                var self = this;
                window.cartItems = self.model.get('items').length;
                self.model.set("futureDates",res.futureDate);
                self.render();
            },
            getProductDates:function(res){
                var productCodes=[],itemsLen = res.get('items').length,j=0,self = this;
                    for(j;j<itemsLen;j++){
                        var code = res.get('items').models[j].get('product.productCode');
                        if(productCodes.length>0 && productCodes.indexOf(code)<0){
                            productCodes.push(code);
                        }else if(productCodes.length<1){
                            productCodes.push(code);
                        }
                    }
                //return new Promise(function(resolve,reject){
                    if(productCodes.length>0){
                        api.request("post","/sfo/get_dates",{data:productCodes,customerId:require.mozuData('user').lastName,site:"dsd"}).then(function(resp) {
                            window.futureDates = resp;
                            // console.log(resp);
                            if(resp.isNewHeatSensitive) {
                                // for(res.get("items"))
                                for(i=0;i<itemsLen;i++){
                                    res.get('items').models[i].set('isHeatsensitive',resp.isNewHeatSensitive[i].isHeatSensitive);
                                    if(itemsLen === i+1) {
                                        self.callback(self.assignFutureDates(resp,res));
                                    }
                                }
                            } else {
                                self.callback(self.assignFutureDates(resp,res));
                            }
                            res.set("hello","dolly");
                        },function(err){
                            self.callback(res);
                        });
                    }else{
                        self.callback(res);
                    }
                //});
            },
            assignFutureDates:function(dates,order){
                var orderLen = order.get('items').length,i=0,blackoutDates = dates.BlackoutDates,heat = false,self = this,futureDate;
                for(i;i<orderLen;i++){
                    var code =order.get('items').models[i].get('product.productCode'),
                    futureProduct = _.findWhere(dates.Items, {SKU: code});
                    if(futureProduct){
                        var isHeatSensitive = order.get('items').models[i].get("isHeatsensitive"); 
                        if(isHeatSensitive && Hypr.getThemeSetting('heatSensitive')){
                            heat = true;
                            futureDate = self.heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).fDate? self.heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                            order.get('items').models[i].get('product').set('futureDate',futureDate);
                        }else{
                            futureDate = self.availableDate(futureProduct.FirstShipDate,blackoutDates).fDate?self.availableDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                            order.get('items').models[i].get('product').set('futureDate',futureDate);
                        }
                        if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory>0){
                            order.get('items').models[i].get('product').set('inventory', true);
                        }else if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory<1){
                            order.get('items').models[i].get('product').set('inventory', true);
                        }else{
                            order.get('items').models[i].get('product').set('inventory', true);
                        }
                    }     
                }
                if(heat && Hypr.getThemeSetting('heatSensitive')){
                    futureDate = this.heatSensitvieDate(dates.FirstShipDate,blackoutDates).fDate? this.heatSensitvieDate(dates.FirstShipDate,blackoutDates).date:"undefined";
                }else{
                    futureDate = this.availableDate(dates.FirstShipDate,blackoutDates).fDate?this.availableDate(dates.FirstShipDate,blackoutDates).date:"undefined";
                }
                order.futureDate = futureDate;
                return order;
            },
            updateFutureDates:function(dates,order){
                var orderLen = order.items.length,i=0,blackoutDates = dates.BlackoutDates,heat = false,self = this,futureDate;
                for(i;i<orderLen;i++){
                    var code =order.items[i].product.productCode,
                    futureProduct = _.findWhere(dates.Items, {SKU: code});
                    if(futureProduct){
                        var isHeatSensitive = order.items[i].isHeatsensitive; 
                        if(isHeatSensitive && Hypr.getThemeSetting('heatSensitive')){
                            heat = true;
                            futureDate = self.heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).fDate? self.heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                            order.items[i].product.futureDate = futureDate;
                        }else{
                            futureDate = self.availableDate(futureProduct.FirstShipDate,blackoutDates).fDate?self.availableDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                            order.items[i].product.futureDate = futureDate;
                        }
                        if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory>0){
                            order.items[i].product.inventory = true;
                        }else if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory<1){
                            order.items[i].product.inventory = true;
                        }else{
                            order.items[i].product.inventory = true;
                        }
                    }     
                }
                if(heat && Hypr.getThemeSetting('heatSensitive')){
                    futureDate = this.heatSensitvieDate(dates.FirstShipDate,blackoutDates).fDate? this.heatSensitvieDate(dates.FirstShipDate,blackoutDates).date:"undefined";
                }else{
                    futureDate = this.availableDate(dates.FirstShipDate,blackoutDates).fDate?this.availableDate(dates.FirstShipDate,blackoutDates).date:"undefined";
                }
                order.futureDate = futureDate;
                return order;
            },
            availableDate:function(fdate,BlackoutDates){
                var udate = new Date(fdate),
                    me=this,
                    businessdays=2;
                var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());  
                // sdate.setUTCHours(new Date().getUTCHours());
                // var hours = sdate.getHours();
                // if(hours >= 12){ 
                //     sdate.setDate(sdate.getDate()+1);
                // }
                var blackoutDates = [];
                if(BlackoutDates.length > 0) {
                    blackoutDates =BlackoutDates.map(function(d) {
                        return me.formatDate(d);
                    });
                }
                var nextday = new Date(),day,month,year,currentDate,comparedate;
                while(businessdays) {
                    nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
                    day = nextday.getDay(); 
                    month = nextday.getMonth();
                    year = nextday.getFullYear();
                    currentDate = nextday.getDate(); 
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(day===0 || day===6 ||blackoutDates.indexOf(comparedate) !== -1) {
                        nextday.setFullYear(year,month,currentDate);
                    } else {
                        businessdays--;
                    }
                }
                if(sdate>nextday){
                    return {fDate:true,date:me.getMonth(sdate.getMonth())+' '+('0'+sdate.getDate()).slice(-2)+','+sdate.getFullYear()};
                }else{
                    return  {fDate:false};
                }
                
            },
            heatSensitvieDate:function(sfo,BlackoutDates){
                var udate = new Date(sfo),
                    me=this,
                    businessdays=2;
                var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());  
                // sdate.setUTCHours(new Date().getUTCHours());
                // var hours = sdate.getHours();
                // if(hours >= 12){ 
                //     sdate.setDate(sdate.getDate()+1);
                // }
                var blackoutdates = [];
                if(BlackoutDates.length > 0) {
                    blackoutdates = BlackoutDates.map(function(d) {
                        return me.formatDate(d); 
                    });
                }
                var nextday = new Date(),day,month,year,currentDate,comparedate;
                while(businessdays){
                    nextday.setFullYear(nextday.getFullYear(),nextday.getMonth(),(nextday.getDate()+1));
                    day = nextday.getDay();
                    month = nextday.getMonth();
                    year = nextday.getFullYear();
                    currentDate = nextday.getDate(); 
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(day===0 || day===6 || day===3 || day===4 || day===5 ||blackoutdates.indexOf(comparedate) !== -1){
                        nextday.setFullYear(year,month,currentDate);
                    }else{
                        businessdays--;
                    }
                }
                nextday.setFullYear(year,month,(currentDate));
                if(sdate>nextday){
                    return {fDate:true,date:me.getMonth(sdate.getMonth())+' '+('0'+sdate.getDate()).slice(-2)+','+sdate.getFullYear()};
                }else{
                    return  {fDate:false};
                }
            },
            formatDate:function(date) {
                var udate = new Date(date);
                var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());  
                // sdate.setUTCHours(new Date().getUTCHours());
                // var hours = sdate.getHours();
                // if(hours >= 12){ 
                //     sdate.setDate(sdate.getDate()+1);
                // }
                return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
            },
            getMonth:function(month){
                var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                return months[month];
            },
            render:function(){
                Backbone.MozuView.prototype.render.call(this);
                placeorder.submitOrder.updateOrder();
                if(this.model.get('total')>=Hypr.getThemeSetting('minimumOrderAmount')){
                    $('#review-your-order .checkout-button').removeClass('disabled');
                    if(!$('.place-order').is(':hidden')){
                        if($(window).width()<767){
                            $(".review-order-container .checkout-button").fadeOut(function(){ 
                           $(".review-order-container .mobile-order").fadeIn();  
                        });
                        }else{
                       $(".review-order-container .checkout-button").fadeOut(function(){ 
                           $(".review-order-container .placeorder").fadeIn();  
                        });
                        }
                    }
                     
                }else if(this.model.get('total') < Hypr.getThemeSetting('minimumOrderAmount')){
                    // Changed button disable prop to disabled class
                    $('#review-your-order .checkout-button').addClass('disabled');
                    if(!$('.place-order').is(':hidden')){
                        $('.place-order').slideUp('slow');
                        $('.order-body').slideDown('slow');
                        $('.dsdcheckoutheader .editchange').hide(function(){
                            $('.dsdcheckoutheader .collapsed').show();
                        });
                    }
                }
                  $("body").find(".overlay-right-side").hide();
                  if($(window).width()<768 && window.location.pathname === "/"){
                    if(this.model.get('items').length < 1){
                        $('html, body').animate({
                            scrollTop: $('.dsdorderlabel').offset().top
                        }, 800);
                    }
                  }
                //Check inventory   
                if(window.oosCheck){
                    this.checkInventory();
                }else if($.cookie("oosProducts") && JSON.parse($.cookie("oosProducts")).length>0){
                    this.outOfStockMessage();
                    $(document).find('.oos-error-msg').text(Hypr.getLabel('ooserror')); 
                }
                this.getDates();
            }
        });
         
        var storeAdress = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/selected-store",
            
             getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                //c.model.items[0].product.measurements.weight.value
                var items = c.model.items;
                var itemLength = c.model.items.length;
                var i;
                var weight = 0;
                for(i=0;i<itemLength;i++){
                    weight += items[i].product.measurements.weight.value * items[i].quantity;
                }
                if(weight>0){
                    c.model.totalWeight=weight;
                }
                c.model.storeAddress = window.storeAddress;
                return c;
            },
            updatedAddress:function(){
                var a = window.storeAddress;
                return a;
            },
            render:function(){
                Backbone.MozuView.prototype.render.call(this);
            }
        });
        
        var cartModel = new CartModels.Cart();
        var miniCartView = new MiniCartView({ 
            el: $('#review-your-order'),
            model: cartModel
        });
        window.cart = miniCartView; 
        var storeadress = new storeAdress({
            el: $('#store-address'),
            model: cartModel
        }); 
        
                    
        var storeAddress = "";
        var accountId= require.mozuData('user').accountId;
            api.request('GET','api/commerce/customer/accounts/'+accountId).then(function(resp){
               storeAddress =  resp.contacts[0];
               window.storeAddress = storeAddress;
               storeadress.render();
        });    
    $(document).ready(function(){
        cartModel.apiGet();
  /*      $(document).on('mouseover','.qty select',function(e){
            
            var self = $(this);
            if(parseInt(self.val()) === 4){
                self.attr('stock',true);
            }
            if(!self.attr('stock')){
                var pcode= self.attr('data-mz-productcode');
                var pid = $(this).attr('data-mz-productid');
                var selected = self.find('option:selected').val();
                 api.get('product',pcode ).then(function(sdkProduct) {
                    var PRODUCT = new ProductModels.Product(sdkProduct.data);
                    var stock  = PRODUCT.get('inventoryInfo').onlineStockAvailable;
                    var a="";
                    if(stock < 4){
                        for(var i=1;i<=stock;i++){
                           a += "<option value='"+i+"'>"+i+"</option>";
                        }
                        self.html(a);
                        self.val(selected);
                        self.attr('stock',true);
                    }else{
                       self.attr('stock',true);
                    }
                });
            }
        });*/
        var cartItems = window.cartItems = 0;
        var futureDates = window.futureDates=null;
        $.removeCookie('oosProducts');
        var oosCheck = window.oosCheck = true;
        $(document).on('click','.btn.placeorder',function(){
            $('.submitorder .placeorder').trigger('click');
        });
    });
    
    return { MiniCart:miniCartView,
              storeadress:storeadress};  
});




 





























