require([
    "modules/jquery-mozu", "underscore", "modules/api",
    "hyprlive", "modules/backbone-mozu", 'modules/models-product',
    "dsd-orderprocess/future-popup",'modules/models-cart'
], function($, _, api, Hypr,Backbone, ProductModels,futurePopup,CartModels) {    
    var orderhistory = Backbone.MozuView.extend({
        templateName: "modules/my-account/order-history-list",
        getRenderContext: function () {
            var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
            //c.model.items[0].product.measurements.weight.value
            var order = c.model.items;
            var orderLength = c.model.items.length;
            var i,j,self=this;
          
            for(i=0;i<orderLength;i++){
                var itemsLength = order[i].items.length;
                  var weight = 0;
                for(j=0;j<itemsLength;j++){
                    weight += order[i].items[j].product.measurements.weight.value * order[i].items[j].quantity;
                }
                if(weight>0){
                    c.model.items[i].totalWeight=weight.toFixed(2);
                    c.model.items[i].totalcount = order[i].items.length;
                }
            }
            var orders = [];
            $.each(c.model.items,function(){
                orders.push(this.orderNumber);
            });
            this.lookupRequestors(orders);

            return c; 
        },
        lookupRequestors: function(orderIds) {
            api.request('POST', "/svc/order_information", { orders:orderIds  }).then(function(res){
            $(".placed-by").each(function(pb) {
            var z = this;
            var submitter = _.find(res.result, function(lookup) {
            return z.getAttribute("orderid") == lookup.MozuOrderNumber;
            });
            submitter = (submitter === undefined ? "unknown" : submitter.Email );
            $('.placed-by[orderID="'+z.getAttribute("orderid")+'"]').text(submitter);
            });
            });
		},
        addtocart: function(e) {
            var orderNumber = $(e.currentTarget).attr('data-mz-ordernumber'),me=this;
            //future Date PopUp
            var futureDates = me.getSelectedProductDates(orderNumber);
            if(futureDates.dates){
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.gettingProductsData(orderNumber,e);
                    } else {
                        futurePopup.AlertView.closepopup();
                    }
                });
            }else{
                me.gettingProductsData(orderNumber,e);
            }
        },
        getSelectedProductDates:function(orderNumber){
            var productDates = [],fDate,date,count=0;
            if($(window).width()>1024){
                var pros = $('.desktop[data-mz-ordernumber="' + orderNumber + '"]');   
                count = pros.find('[data-mz-productCode]').filter(':checked').length;
                $.each(pros, function(i, v) {
                    if ($(v).find('[data-mz-productCode]').is(':checked') && $(v).find('.orderhistory-future').text().trim().length>10) {  
                        var prod = {};
                        prod.name = $(v).find('.ord-desc').find('span').first().text().trim();
                        prod.date = $(v).find('.orderhistory-future').text().split(' ')[2].concat( $(v).find('.orderhistory-future').text().split(' ')[3]);
                        productDates.push(prod);
                    }
                });
            }else{
                count = $('.mobile.row1[data-mz-orderNumber="'+orderNumber+'"]').find('[data-mz-productCode]').filter(':checked').length;
                $.each($('.mobile.row1[data-mz-orderNumber="'+orderNumber+'"]'),function(i,v){
                    if ($(v).find('[data-mz-productCode]').is(':checked') && $(v).find('.orderhistory-future').text().trim().length>10) {  
                        var prod = {};
                        prod.name =  $(v).find('.ord-desc').find('span').first().text().trim();
                        prod.date = $(v).find('.orderhistory-future').text().split(' ')[2].concat( $(v).find('.orderhistory-future').text().split(' ')[3]);
                        productDates.push(prod);
                    }
                });
            }
            if(productDates.length === 1 && count=== 1) {
                    fDate = new Date(productDates[0].date);
                    date  = ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear();
                    return {dates:true,btn:"future-date",
                        message:"This item will be available on "+date+". You can add this item, but your order will not ship before "+date+". There are no partial shipment."};
            }else if(productDates.length >0 && count>1){
                var earliest = productDates.reduce(function (pre, cur) {
                    return Date.parse(pre.date) < Date.parse(cur.date) ? cur : pre;
                });
                fDate = new Date(earliest.date);
                date  = ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear();
                var msg = 'You selected items that are  currently unavailable. You can add these items and your order will ship after '+date+', when the "'+earliest.name+'" is available. There are no partial shipments.';
                return {dates:true,message: msg,btn:"future-dates"};
            }else{
                return {dates:false};
            }
        },
        gettingProductsData:function(orderNumber,e){
            var products = [];
            if($(window).width()>1024){
                var pros = $('.desktop[data-mz-ordernumber="' + orderNumber + '"]');                
                $.each(pros, function(i, v) {
                    if ($(v).find('[data-mz-productCode]').is(':checked')) {    
                        var productCode = $(v).find('[data-mz-productCode]').attr('data-mz-productCode');
                        var location = $(v).find('[data-mz-productCode]').attr('data-mz-location');
                        var qty = parseInt($(v).find('.ord-qty').text(),10);
                        var name = $(v).find('.ord-desc').find('span').first().text().trim();
                        var productObj = {
                            name : name,
                            productcode: productCode,
                            quantity: qty,
                            location : location
                        };
                        products.push(productObj);   
                    }
                });
            }else{
                $.each($('.mobile.row1[data-mz-orderNumber="'+orderNumber+'"]'),function(i,v){
                    if($(v).find('[data-mz-productCode]').is(':checked')){
                        var qty;
                        var productCode = $(v).find('[data-mz-productCode]').attr('data-mz-productCode');
                        var location = $(v).find('[data-mz-productCode]').attr('data-mz-location');
                        var name = $(v).find('.ord-desc').find('span').first().text().trim();
                        if(productCode === $('.mobile.row2[data-mz-orderNumber="'+orderNumber+'"]').find('[data-mz-productCode = "'+productCode+'"]').attr('data-mz-productCode')){
                           qty = parseInt($('.mobile.row2[data-mz-orderNumber="'+orderNumber+'"]').find('[data-mz-productCode = "'+productCode+'"]').text(),10);
                        }
                        var productObj = {
                            name : name,
                            productcode: productCode,
                            quantity: qty,
                            location : location
                        };
                        products.push(productObj);
                    }
                });
            }
            if (products.length > 0) {
                $(".overlay-full-width").show();
                this.makeQuickOrder(products,orderNumber,$(e.currentTarget));
            }
        },
        makeQuickOrder: function(products,orderNumber,clickele) {
            var self = this, popuparr = [], productAdded = 0, time = 2000, errorArray, popUpmodel;
            popuparr = {
                poparr:[],
                successmsg:''
            };
            var count=products.length;
            if (products.length > 0) {
                var productCodes = [],locationCodes=[],productData=[];
                products.filter(function(e){
                    var temp = {};
                    temp.productCode = e.productcode;
                    temp.quantity = e.quantity;
                    temp.inventory = null;
                    temp.name = e.name;  
                    productData.push(temp);
                    locationCodes.push(e.location);
                    productCodes.push(e.productcode);
                });
                api.request('POST','api/commerce/catalog/storefront/products/locationinventory?pageSize=500',{productCodes:productCodes,locationCodes:locationCodes.filter(function(R,i){return locationCodes.indexOf(R) == i;})}).then(function(res){
                    var updatedProducts = productData.map(function(e){
                        var obj = _.findWhere(res.items,{productCode: e.productCode});
                        if(obj){
                            e.inventory = obj.stockAvailable;
                        }else{
                            e.inventory = "undefined"; 
                        }
                        return e;
                    });
                    if(updatedProducts.length > 0){
                        var result = self.validateQtyRistrection(updatedProducts,orderNumber);
                        if(result.items.length > 0){
                            api.request('POST', '/svc/addall_products_cart', result.items).then(function(res){
                                console.log(res);
                                //reviewCart.MiniCart.updateReviewCart(); 
                                window.cartModel.apiGet().then(function(res){
                                    console.log(res);
                                    window.cartItems = res.data.items;
                                });
                                var popuparr = {}, QOModel = Backbone.MozuModel.extend({});
                                popuparr.poparr = result.error;
                                popuparr.successmsg =Hypr.getLabel('successatc');
                                var popUpmodel = new PopupModel({
                                    el: $('.pop-up'),
                                    model: new QOModel(popuparr)
                                });                                            
                                popUpmodel.render(); 
                                $(document).find('.pop-up').show();
                                setTimeout(function(){$(document).find('.pop-up').hide();},2000);
                                $("body").find(".overlay-full-width").hide();
                            },function(error){
                                $("body").find(".overlay-full-width").hide();
                                console.log(error);
                            });  
                        }else{
                            $("body").find(".overlay-full-width").hide();   
                        }
                    }else{ 
                        $("body").find(".overlay-full-width").hide();
                    }
                },function(error){
                    $("body").find(".overlay-full-width").hide();
                    console.log("can not get the inventorys.");
                });
            }else{
                $(".overlay-full-width").hide();
            }
        },
        validateQtyRistrection: function(productData,orderNo){
            var cartItems = window.cartItems,cartItemsLength = cartItems.length;
            var resultData = [], errorData = [], popObj, myResult = {};
            productData.filter(function(item){
                var temp = cartItems.length > 0 && cartItems.filter(function(e){ 
                    return e.product.productCode == item.productCode;}),
                    obj = {}, msg="";
                if(temp.length > 0){
                    var qty = temp[0].quantity;
                    if(parseInt(qty,10) == 4){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html(msg);    
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.quantity,10) > (4-parseInt(qty,10))){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(item.inventory == "undefined" && parseInt(qty,10) < 4 && parseInt(item.quantity,10) <= (4-parseInt(qty,10))){
                        obj.productcode = item.productCode;
                        obj.quantity = item.quantity;
                        resultData.push(obj);
                    }else if(parseInt(item.inventory,10) <= 0){
                        msg='This item is out of Stock. <span class="notify">Notify Me</span>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.quantity,10) <= (4-parseInt(qty,10)) && (parseInt(item.inventory,10)-parseInt(qty,10)) >= parseInt(item.quantity,10)){
                        obj.productcode = item.productCode;
                        obj.quantity = item.quantity;
                        resultData.push(obj); 
                    }else if((parseInt(item.inventory,10)-parseInt(qty,10)) < parseInt(item.quantity,10)){
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html("Only "+ (parseInt(item.inventory,10)-parseInt(qty,10)) +" in stock");   
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }
                }else{
                    if(item.inventory == "undefined" && parseInt(item.quantity,10) <= 4){
                        obj.productcode = item.productCode;
                        obj.quantity = item.quantity;
                        resultData.push(obj);
                    }else if(parseInt(item.inventory,10) > 0 && parseInt(item.quantity,10) <= 4){
                        if(parseInt(item.inventory,10) >= parseInt(item.quantity,10)){
                            obj.productcode = item.productCode;
                            obj.quantity = item.quantity;
                            resultData.push(obj);
                        }else{
                            $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html("Only "+ parseInt(item.inventory,10) +" in stock");   
                            popObj = {
                                prodName : item.name
                            };
                            errorData.push(popObj);
                        }
                    }else if(parseInt(item.quantity,10) > 4){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.inventory,10) <= 0){
                        msg='This item is out of Stock. <span class="notify">Notify Me</span>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [order-error-code="'+ item.productCode.trim() +'"]').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }
                }
            });
            myResult.items = resultData;
            myResult.error = errorData;
            return myResult;
        },
        showMessages: function(errorArray, productAdded) {
            $(".overlay-full-width").hide();
        },

        render: function() {
            Backbone.MozuView.prototype.render.call(this);
            //var cartItems = reviewCart.MiniCart.model.get('items').models;
           /* console.log(cartItems.length);
            if (cartItems.length > 0) {
                $('.btn-proceedtocheck').prop('disabled', false);
            } else {
                $('.btn-proceedtocheck').prop('disabled', true);
            }*/
        }
    });
  var PopupModel = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/addtocartmodalpop",
         render: function() {
            
            Backbone.MozuView.prototype.render.call(this);
         }
        
    });
    $(document).ready(function() {
        
        /*if ((window.location.host.indexOf('east') === -1 && window.location.host.indexOf('west') ===-1 && window.location.host.indexOf('jellybellydsd') !== -1) || (window.location.host.split(".")[0].split("-")[1] === Hypr.getThemeSetting('wwwSiteLink').split(".")[0].split("-")[1])) {
            $(".modal .modal-message").html("Please select a store to see its order history.").parents(".modal").show();
            $(".modal .btn-yes").on("click",function(){
                window.location = "/";     
            });
            
        }*/
        if(window.location.origin.indexOf('jellybellydsd')>-1){
            if (window.location.host.indexOf('east') === -1 && window.location.host.indexOf('west') ===-1){
                $(".modal .modal-message").html("Please select a store to see its order history.").parents(".modal").show();
                $(".modal .btn-yes").on("click",function(){
                    window.location = "/";     
                });
            }    
        }else if(window.location.origin.indexOf('mozu')>-1){
            if(window.location.host.split(".")[0].split("-")[1] === Hypr.getThemeSetting('wwwSiteLink').split(".")[0].split("-")[1]){
                $(".modal .modal-message").html("Please select a store to see its order history.").parents(".modal").show();
                $(".modal .btn-yes").on("click",function(){
                    window.location = "/";     
                });
            }   
        }
        var cartModel = window.cartModel = CartModels.Cart.fromCurrent(),cartItems;
            cartModel.apiGet().then(function(res){
                window.cartItems = cartItems = res.data.items;
            });
        
        var QOModel = Backbone.MozuModel.extend({});
        var orderobj = {
            orderStaus: function() {
                var self = this;
                api.request('GET', ' api/commerce/orders/?filter=Status ne Created and Status ne Validated and Status ne Pending and Status ne Abandoned and Status ne Errored&startIndex=0&pageSize=5&receiverVersion=2&responseFields=items(orderNumber,billingInfo,status,total,subtotal,items,fulfillmentInfo,submittedDate)').then(function(resp) {
                    getProductDates(resp,self.dateCallBack);
                    
                });
            },
            dateCallBack:function(resp){
                if(resp.items && resp.items.length>0){
                    var i = 0,len = resp.items.length;
                    for(i;i<len;i++){
                        if(resp.items[i].billingInfo && (resp.items[i].billingInfo.purchaseOrder !== undefined)){
                            if(resp.items[i].billingInfo.purchaseOrder.customFields && resp.items[i].billingInfo.purchaseOrder.customFields.length && resp.items[i].billingInfo.purchaseOrder.customFields[0].value){
                                resp.items[i].billingInfo.purchaseOrder.customFields[0].value = orderobj.formatDates(resp.items[i].billingInfo.purchaseOrder.customFields[0].value);
                            } 
                        }
                        //  && ){
                        //     
                        // }
                        /*else{
                             resp.items[i].billingInfo.purchaseOrder.customFields[0].value = "N/A";
                        }*/
                        // if(resp.items[i].packages.length>0){ 
                        //     resp.items[i].packages[0].fulfillmentDate = formatDate(resp.items[i].packages[0].fulfillmentDate);
                        // }
                    }
                }
                var orderStatus = new orderhistory({
                    el: $('[dsd-order-history-list]'),
                    model: new QOModel(resp)
                });
                orderStatus.render();
            },
            formatDates:function(date){
                var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
                var d = date.split('-');
                return (months[d[0]>9?(parseInt(d[0],10)-1):(parseInt(d[0].substr(1, 1),10)-1)]+' '+d[1]+', '+d[2]);
            }
        };
        orderobj.orderStaus();

        $(document).on('click', '.btn-proceedtocheck', function() {
            window.location.assign(window.location.origin);
        });
        $(document).on("click", ".acc-tab-link", function() {
            if ($(this).children(".collapse-icon").hasClass("minus")) {
                $(this).children(".collapse-icon").removeClass('minus');
                $(this).next(".acc-tab-content-container").removeClass("active");

            } else {
                $(".collapse-icon").removeClass('minus');
                $(this).children(".collapse-icon").addClass('minus');
                $(".acc-tab-content-container").removeClass("active");
                $(this).next(".acc-tab-content-container").addClass("active");
                //  $(".btn-proceedtocheck").prop('disabled',true); 
            }

        });

        $(document).on('click', '.select-all', function() {
            if ($(this).is(":checked")) {
                $(this).parents('.list-of-order').find('.prod-selection').each(function(index) {
                    if(!$(this).attr('disabled')){
						$(this).prop("checked", true);
					}else{
						$(this).prop("checked", false);
					}	
                });
                if($(this).parents('.list-of-order').find('td.checkbox').filter(':visible').find('.checkboxcustom input').filter(':checked').length>0)
                    $(this).parents('.list-of-history-item-container').find('.add-to-cart').prop("disabled", false);
            } else {
                $(this).parents('.list-of-order').find('.prod-selection').each(function(index) {
                    $(this).prop("checked", false);
                });
                $(this).parents('.list-of-history-item-container').find('.add-to-cart').prop("disabled", true);
            }

        });

        $(document).on('click', '.prod-selection', function() {
            if ($(this).is(":checked")) {
                $(this).parents('.info-row').addClass("font-bold");
            } else {
                $(this).parents('.info-row').removeClass("font-bold");
            }
            var totalCheckBox, totalChecked;
            if ($(window).width() > 1024) {
                totalCheckBox = $(this).parents('.list-of-order').find('.desktop .prod-selection').length;
                totalChecked =$(this).parents('.list-of-order').find('.desktop .prod-selection:checked').length;
            }else {
                totalCheckBox = $(this).parents('.list-of-order').find('.mobile .prod-selection').length;
                totalChecked = $(this).parents('.list-of-order').find('.mobile .prod-selection:checked').length;
            }
            if ((totalCheckBox == totalChecked) && (totalCheckBox !== 0)) {
                $(this).parents('.list-of-order').find('.select-all').prop("checked", true);
            } else {
                $(this).parents('.list-of-order').find('.select-all').prop("checked", false);
            }

            if (totalChecked === 0) {
                $(this).parents('.list-of-history-item-container').find('.add-to-cart').prop("disabled", true);
            } else {
                $(this).parents('.list-of-history-item-container').find('.add-to-cart').prop("disabled", false);
            }

        });
        $(document).on('click', ".order-history .checkbox label", function() {
            var self = $(this);
            var el = self.prev();
            if (el.prop("checked")) {
                el.trigger("click");

            } else {
                el.trigger("click");
            }

        });
        var getProductDates = function(res,callback){
            var ordersLen =  res.items.length,i=0,productCodes=[];
            for(i;i<ordersLen;i++){
                var itemsLen = res.items[i].items.length,j=0;
                for(j;j<itemsLen;j++){
                    var code = res.items[i].items[j].product.productCode;
                    if(productCodes.length>0 && productCodes.indexOf(code)<0){
                        productCodes.push(code);
                    }else if(productCodes.length<1){
                        productCodes.push(code);
                    }
                }
            }
            if(productCodes.length>0){
                api.request("post","/sfo/get_dates",{data:productCodes,customerId:require.mozuData('user').lastName,site:"dsd"}).then(function(resp) {
                    if(resp.FirstShipDate) {
                        api.request("post","/rof/get_coldpackDetails",{data:res,customerId:require.mozuData('user').lastName,site:"dsd","FirstShipDate":resp.FirstShipDate}).then(function(productDetails){
                        var d =  assignFutureDates(productDetails.data,resp);
                            callback(d);
                        }).catch(function(e) { 

                        }).then(function() {

                        });
                    } else {
                        var d =  assignFutureDates(res,resp);
                        callback(d);
                    }
                },function(err){
                    console.log(err);
                    callback(res);
                });
            }else{
                 callback(res);
            }
        };
        var assignFutureDates = function(orders,dates){
            var orderLen = orders.items.length,i=0,blackoutDates = dates.BlackoutDates;
            for(i;i<orderLen;i++){
                var prodLen = orders.items[i].items.length,j=0;
                for(j;j<prodLen;j++){
                    var code = orders.items[i].items[j].product.productCode,
                        futureProduct = _.findWhere(dates.Items, {SKU: code});
                    
                    if(futureProduct){
                        var isHeatSensitive = orders.items[i].items[j].product.isHeatSensitiveDatas;
                        if(isHeatSensitive ){
                            orders.items[i].items[j].futureDate = heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).fDate? heatSensitvieDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                        }else{
                            orders.items[i].items[j].futureDate = availableDate(futureProduct.FirstShipDate,blackoutDates).fDate?availableDate(futureProduct.FirstShipDate,blackoutDates).date:"undefined";
                        }
                        if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory>0){
                            orders.items[i].items[j].inventory = true;
                        }else if(typeof futureProduct.inventory !=="undefined" && futureProduct.inventory<1){
                            orders.items[i].items[j].inventory = false;
                        }else{
                            orders.items[i].items[j].inventory = true;
                        }
                    }    
                }
            }
            return orders;
        };
        var availableDate = function(fdate,BlackoutDates){
            var udate = new Date(fdate),
                me=this,
                businessdays=2;
            var sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()); 	    
            // sdate.setUTCHours(new Date().getUTCHours());
            // var hours = sdate.getHours();
            // if(hours >= 12){ 
            //     sdate.setDate(sdate.getDate()+1);
            // }
            var blackoutDates = [];
            if(BlackoutDates.length > 0) {
                blackoutDates =BlackoutDates.map(function(d) {
                    return formatDate(d);
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
                return {fDate:true,date:getMonth(sdate.getMonth())+' '+('0'+sdate.getDate()).slice(-2)+','+sdate.getFullYear()};
            }else{
                return  {fDate:false};
            }
            
        };
        var heatSensitvieDate = function(sfo,BlackoutDates){
            var udate = new Date(sfo),
                me=this,
                businessdays=2;
            var sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()); 	           
            // sdate.setUTCHours(new Date().getUTCHours());
            // var hours = sdate.getHours();
            // if(hours >= 12){ 
            //     sdate.setDate(sdate.getDate()+1);
            // }
            var blackoutdates = [];
            if(BlackoutDates.length > 0) {
                blackoutdates = BlackoutDates.map(function(d) {
                    return formatDate(d); 
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
                return {fDate:true,date:getMonth(sdate.getMonth())+' '+('0'+sdate.getDate()).slice(-2)+','+sdate.getFullYear()};
            }else{
                return  {fDate:false};
            }
        };
        var formatDate =  function(date) {
                var udate = new Date(date);
                var sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()); 	
                // sdate.setUTCHours(new Date().getUTCHours());
                // var hours = sdate.getHours();
                // if(hours >= 12){ 
                //     sdate.setDate(sdate.getDate()+1);
                // }
                return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        };
        
        var getMonth = function(month){
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            return months[month];
        };
        //Notify me
        $(document).on("click",".notify",function(e){
            var customer = '',pCode = $(this).parents('.orderhistory-future').attr('order-error-code-future');
            if($.cookie('userData') && JSON.parse($.cookie('userData')).email){
              customer = JSON.parse($.cookie('userData')).email;
            }
            
            $.colorbox({
                open : true,
                maxWidth : "100%", 
                maxHeight : "100%",
                scrolling : false, 
                fadeOut : 500,
                top:"30%",
                html : "<div id='notify-me-dialog'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input id='notify-me-email' type='email' value='"+customer+"'>"+
                "<span id='notify-me-button' data-mz-product-code='" + pCode + "'>NOTIFY ME</span></form>"+
                "<div class='notify-error'>Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.</div></div>", 
                overlayClose : true, 
                onComplete : function () {
                    $('#cboxClose').show();
                    $('#cboxLoadedContent').css({
                    background : "#ffffff"
                    });
                    $('body').css('overflow','hidden');
                },
                onClosed:function(){
                    $('body').css('overflow','auto');
                    }
            });
        });    
        $(document).on('click','#notify-me-button', function(e) {
            if($('#notify-me-email').val() !== ""){
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                var patt = new RegExp(re);
                if(patt.test($('#notify-me-email').val())){
                    var obj = {
                        email: $('#notify-me-email').val(),
                        customerId: require.mozuData('user').accountId,
                        productCode: e.target.getAttribute('data-mz-product-code'),
                        locationCode: '' //this.model.get('inventoryInfo').onlineLocationCode
                    };
                    if(window.location.host.indexOf('s24079') > -1 || window.location.host.indexOf('east') > -1){
                        obj.locationCode = 'MDC';
                    }else if(window.location.host.indexOf('s24080') > -1 || window.location.host.indexOf('west') > -1){
                        obj.locationCode = 'FDC';
                    }
                    
                    api.create('instockrequest',obj ).then(function () {
                        $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                        }, function (err) {
                            console.log(err);
                            if(err.errorCode === "ITEM_ALREADY_EXISTS"){
                                $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html(err.message).css('color','red').fadeIn(500); });
                            }else{
                                $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
                            }
                    });
                }else{
                    $('.notify-error').show();
                } 
            }else{
                $('.notify-error').show(); 
            } 
        });
        $(document).on('keypress', '#notify-me-email', function (e) {
            if (e.which === 13) {
              e.preventDefault();
              $('#notify-me-button').trigger('click');
              return false;
            }
        });

    });

});



