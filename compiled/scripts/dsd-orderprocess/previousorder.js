require([
    "modules/jquery-mozu", "underscore", "modules/api",
    "hyprlive", "modules/backbone-mozu", 'modules/models-product', 'modules/models-cart',
    "dsd-orderprocess/review-cart","dsd-orderprocess/future-popup", "vendor/jquery-ui.min"
], function($, _, api, Hypr, Backbone, ProductModels, CartModels, reviewCart,futurePopup) {

    var orderstatus = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/previousorder",
        additionalEvents: {
            "click .checkboxcustom label": "checkBox",
            "change .qty select": "updateQty",
            "click .clear-cart a": "clearCart",
            "click .dsd-btn": "addToCart",
            "click .dsd-btnformbl": "addtocartformbl"           
        },
        checkBox: function(e) {
            var element = $(e.currentTarget).prev();
            var checkStatus = element.is(':checked');
            var orderNumber = element.attr('data-mz-ordernumber');
            
            if(element.hasClass("select-all-check")){
                if (checkStatus) {
                    $(".magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(":disabled").prop("checked",false);
                    $(".dsd-btn[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",true);
                    $(".dsd-btnformbl[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",true);
                }else{
                    $(".magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(':disabled').prop("checked",true);
                    $(".dsd-btnformbl[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                    $(".dsd-btn[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                }
            }else{
                if (checkStatus) {
                    if(!element.is(':disabled')){
						element.prop("checked",false);
					}else{
						element.prop("checked",true);
					}	
                }else{
                    if(!element.is(':disabled')){
						element.prop("checked",true);
					}else{	
						element.prop("checked",false);
					}	
                    $(".dsd-btnformbl[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                    $(".dsd-btn[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                  
                }                    
                if($(".desktop-check .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']:checked").not(".select-all-check").length == $(".desktop-check .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").length){
                    $(".select-all-check.magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").prop("checked",true);
                    $(".dsd-btn[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                }else{                        
                    $(".select-all-check.magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").prop("checked",false);
                    if($(".desktop-check .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").not(".desktop-check .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']:checked").length == $(".desktop-check .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").length){
                        $(".dsd-btn[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",true);
                    }
                } 
                //for tablet
                if($(window).width()<=1024){
                    if($(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']:checked").not(".select-all-check").length == $(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").length){
                        $(".select-all-check.magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").prop("checked",true);
                        $(".dsd-btnformbl[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",false);
                    }else{
                        
                        $(".select-all-check.magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").prop("checked",false);
                        if($(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").not(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']:checked").length == $(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNumber +"']").not(".select-all-check").length){
                            $(".dsd-btnformbl[data-mz-ordernumber='"+orderNumber +"']").attr("disabled",true);
                        }
                    } 
                }
                
            }           
        },
        addToCart: function(e) {
            var me=this;    
            $("body").find(".overlay-full-width").show();  
            var orderNumber = $(e.currentTarget).attr('data-mz-ordernumber'),
                futureDates = this.getSelectedProductDates(orderNumber,e);
            if(futureDates.dates){
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.gettingProductsData(orderNumber,e);
                    } else {
                        futurePopup.AlertView.closepopup();
                        $("body").find(".overlay-full-width").hide();  
                    }
                });
            }else{
                me.gettingProductsData(orderNumber,e);
            }
        },
        gettingProductsData:function(orderNumber,e){
            var products = [];
            $(e.currentTarget).parents(".ex-desktop").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").each(function(){
                var prod= {};
               prod.productcode = $(this).attr("data-mz-productCode");
               prod.quantity = $(this).attr("data-mz-qty");
               prod.locationCode = $(this).attr("data-mz-locationCode");
               prod.name = $(this).attr("data-mz-name");
               products.push(prod);
                $(this).parents('tr.desktop').find('.pre-error').html('');
            });
            if (products.length > 0) { 
                this.makeQuickOrder(products,$(e.currentTarget).attr('data-mz-ordernumber'),$(e.currentTarget),0);
            }
        },
        addtocartformbl: function(e) {
            var me=this;
            $("body").find(".overlay-full-width").show();        
            var orderNumber = $(e.currentTarget).attr('data-mz-ordernumber'),
            futureDates = this.getSelectedProductDates(orderNumber,e);
            if(futureDates.dates){ 
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.gettingProductsDatambl(orderNumber,e);
                    } else {
                        futurePopup.AlertView.closepopup();
                        $("body").find(".overlay-full-width").hide();  
                    }
                });
            }else{
                me.gettingProductsDatambl(orderNumber,e);
            }
        },
        gettingProductsDatambl:function(orderNumber,e){
            var products = []; 
            $(e.currentTarget).parents(".ex-mobile").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").each(function(){
                var prod= {};
                prod.productcode = $(this).attr("data-mz-productCode");
                prod.quantity = $(this).attr("data-mz-qty");
                prod.locationCode = $(this).attr("data-mz-locationCode");
                prod.name = $(this).attr("data-mz-name");
                products.push(prod);
            });
            if (products.length > 0) { 
                this.makeQuickOrder(products,$(e.currentTarget).attr('data-mz-ordernumber'),0,$(e.currentTarget));    
            }
        },
        getSelectedProductDates:function(orderNumber,e){
            var productDates = [],fDate,date,count=0;
            if($(window).width()>1024){
                count =  $(e.currentTarget).parents(".ex-desktop").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").length;
                if(count>0){
                    $(e.currentTarget).parents(".ex-desktop").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").each(function(i,v){
                        if($(this).attr("data-mz-futureDate")){
                            var prod = {};  
                            prod.name = $(this).attr("data-mz-name");
                            prod.date = $(this).attr("data-mz-futureDate");
                            productDates.push(prod);
                        }
                    });
                }else{
                   $(document).find('td[data-mz-ordernumber="'+orderNumber+'"]').filter(':visible').find('.mz-toggleicon').click();
                   $("body").find(".overlay-full-width").hide();  
                }
            }
            else{
                count =  $(e.currentTarget).parents(".ex-mobile").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").length;
                if(count>0){
                    $(e.currentTarget).parents(".ex-mobile").find('.magic-checkbox[data-mz-ordernumber="' + orderNumber + '"]:checked').not(".select-all-check").each(function(){
                        if($(this).attr("data-mz-futureDate")){
                            var prod = {};  
                            prod.name = $(this).attr("data-mz-name");
                            prod.date = $(this).attr("data-mz-futureDate");
                            productDates.push(prod);
                        }
                    });
                }else{
                    $(document).find('td[data-mz-ordernumber="'+orderNumber+'"]').filter(':visible').find('.mz-toggleiconmbl').click();
                    $("body").find(".overlay-full-width").hide();  
                }
            }    
            if(productDates.length === 1 && count=== 1) {
                    fDate = new Date(productDates[0].date);
                    date  = ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear();
                    return {dates:true,btn:"future-date",
                        message:"This item will be available on "+date+". You can add this, but your order will not ship before "+date+". There are no partial shipment"};
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
        ordersorting: function(e) {
            var sort = $(e.currentTarget).attr('sortby');
            var self = this;
            var desc = false,
                asc = false;
            var orderNumberSort = self.model.get('items');
            for (var i = 0; i < orderNumberSort.length; i++) {
                if (i !== orderNumberSort.length - 1) {
                    if (orderNumberSort[i].submittedDate > orderNumberSort[i + 1].submittedDate) {
                        desc = true;
                        break;
                    } else if (orderNumberSort[i].submittedDate < orderNumberSort[i + 1].submittedDate) {
                        asc = true;
                        break;
                    }
                }
            }
            orderNumberSort.sort(function(a, b) {
                var nameA, nameB;
                if (desc) {
                    nameA = a.submittedDate;
					nameB = b.submittedDate;
                    if (nameA < nameB) //sort string ascending
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0; //default return value (no sorting)
                } else if (asc) {
                    nameA = a.submittedDate;
					nameB = b.submittedDate;
                    if (nameA > nameB) //sort string ascending
                        return -1;
                    if (nameA < nameB)
                        return 1;
                    return 0; //default return value (no sorting)
                }
            });
            self.model.set('items', orderNumberSort);
            self.render();
        },
        ordernumber: function(e) {
            var self = this;
            var desc = false,
                asc = false;
            var orderNumberSort = self.model.get('items'); 
            for (var i = 0; i < orderNumberSort.length; i++) {
                if (i !== orderNumberSort.length - 1) {
                    if (orderNumberSort[i].orderNumber > orderNumberSort[i + 1].orderNumber) {
                        desc = true;
                        break;
                    } else if (orderNumberSort[i].orderNumber < orderNumberSort[i + 1].orderNumber) {
                        asc = true;
                        break;
                    }
                }
            }
            orderNumberSort.sort(function(a, b) {
                if (desc) {
                    return a.orderNumber - b.orderNumber;
                } else if (asc) {
                    return b.orderNumber - a.orderNumber;
                }
            });
            self.model.set('items', orderNumberSort);
            self.render();
        },
        orderamount: function(e) {
            var self = this;
            var desc = false,
                asc = false;
            var orderNumberSort = self.model.get('items');
            for (var i = 0; i < orderNumberSort.length; i++) {
                if (i !== orderNumberSort.length - 1) {
                    if (orderNumberSort[i].total > orderNumberSort[i + 1].total) {
                        desc = true;
                        break;
                    } else if (orderNumberSort[i].total < orderNumberSort[i + 1].total) {
                        asc = true;
                        break;
                    }
                }
            }
            orderNumberSort.sort(function(a, b) {
                if (desc) {
                    return a.total - b.total;
                } else if (asc) {
                    return b.total - a.total;
                }
            });
            self.model.set('items', orderNumberSort);
            self.render();
        },
        fulfillment: function(e) {
            var sort = $(e.currentTarget).attr('sortby');
            var self = this;
            var desc = false,
                asc = false;
            var orderNumberSort = self.model.get('items');
            for (var i = 0; i < orderNumberSort.length; i++) {
                if (i !== orderNumberSort.length - 1) {
                    if (orderNumberSort[i].submittedDate > orderNumberSort[i + 1].submittedDate) {
                        desc = true;
                        break;
                    } else if (orderNumberSort[i].submittedDate < orderNumberSort[i + 1].submittedDate) {
                        asc = true;
                        break;
                    }
                }
            }
            orderNumberSort.sort(function(a, b) {
                var nameA, nameB;
                if (desc) {
                    nameA = a.submittedDate;
					nameB = b.submittedDate;
                    if (nameA < nameB) //sort string ascending
                        return -1;
                    if (nameA > nameB)
                        return 1;
                    return 0; //default return value (no sorting)
                } else if (asc) {
                    nameA = a.submittedDate;
					nameB = b.submittedDate;
                    if (nameA > nameB) //sort string ascending
                        return -1;
                    if (nameA < nameB)
                        return 1;
                    return 0; //default return value (no sorting)
                }
            });
            self.model.set('items', orderNumberSort);
            self.render();
        },
        validateQtyRistrection: function(productData,orderNo){
            var cartItems = reviewCart.MiniCart.model.get('items').models,cartItemsLength = cartItems.length;
            var resultData = [], errorData = [], popObj, myResult = {};
            productData.filter(function(item){
                var temp = cartItems.filter(function(e){return e.get("product").get('productCode') == item.productCode;}), obj = {}, msg="";
                if(temp.length > 0){
                    var qty = temp[0].get('quantity');
                    if(parseInt(qty,10) == 4){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html(msg);    
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.quantity,10) > (4-parseInt(qty,10))){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(item.inventory == "undefined" && parseInt(qty,10) < 4 && parseInt(item.quantity,10) <= (4-parseInt(qty,10))){
                        obj.productcode = item.productCode;
                        obj.quantity = item.quantity;
                        resultData.push(obj);
                    }else if(parseInt(item.inventory,10) <= 0){
                        msg="This item is out of Stock.";
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.quantity,10) <= (4-parseInt(qty,10)) && (parseInt(item.inventory,10)-parseInt(qty,10)) >= parseInt(item.quantity,10)){
                        obj.productcode = item.productCode;
                        obj.quantity = item.quantity;
                        resultData.push(obj); 
                    }else if((parseInt(item.inventory,10)-parseInt(qty,10)) < parseInt(item.quantity,10)){
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html("Only "+ (parseInt(item.inventory,10)-parseInt(qty,10)) +" in stock");   
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
                            $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html("Only "+ parseInt(item.inventory,10) +" in stock");   
                            popObj = {
                                prodName : item.name
                            };
                            errorData.push(popObj);
                        }
                    }else if(parseInt(item.quantity,10) > 4){
                        msg='Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html(msg);
                        popObj = {
                            prodName : item.name
                        };
                        errorData.push(popObj);
                    }else if(parseInt(item.inventory,10) <= 0){
                        msg="This item is out of Stock.";
                        $('tr[data-mz-ordernumber="'+orderNo+'"] [itemcode="'+ item.productCode.trim() +'"]').find('.pre-error').html(msg);
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
        makeQuickOrder: function(products,orderNo,clickele,clickelemob) {
            var errorArray = [], self = this, productAdded = 0, time = 2000, popUpmodel, count = products.length;
            var popuparr = { poparr:[], successmsg:''};
            var productCodes = [],locationCodes=[],productData=[];
            products.filter(function(e){
                var temp = {};
                temp.productCode = e.productcode;
                temp.quantity = e.quantity;
                temp.inventory = null; 
                temp.name = e.name; 
                productData.push(temp);
                locationCodes.push(e.locationCode);
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
                    var result = self.validateQtyRistrection(updatedProducts,orderNo); 
                    if(result.items.length > 0){
                        api.request('POST', '/svc/addall_products_cart', result.items).then(function(res){
                            reviewCart.MiniCart.updateReviewCart();
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
        }, 
        showMessages: function(errorArray, productAdded) { 
              $("body").find(".overlay-full-width").hide();
        },
        render: function() {
            Backbone.MozuView.prototype.render.call(this);
        },
        getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                //c.model.items[0].product.measurements.weight.value
                var items = c.model.items;
                var itemLength = c.model.items.length;
                var i;
                $.each(items,function(i,v){
                    if(items[i].billingInfo.purchaseOrder && items[i].billingInfo.purchaseOrder.customFields){
                        $.each(items[i].billingInfo.purchaseOrder.customFields ,function(k,v){
                            if(v.code=="shipdate"){
                                c.model.items[i].shippingDate=v.value.replace(/-/g,"/");
                                var date = new Date(c.model.items[i].submittedDate);
                                c.model.items[i].submittedDate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear();
                            }
                        });
                    }else{
                        c.model.items[i].shippingDate= "N/A";
                        var date = new Date(c.model.items[i].submittedDate);
                        c.model.items[i].submittedDate = ('0'+(date.getMonth()+1)).slice(-2)+ '/' + ('0'+date.getDate()).slice(-2) + '/' + date.getFullYear();
                    }
                });
                
                
                return c;
            }
    });

    var PopupModel = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/addtocartmodalpop",
         render: function() {
            
            Backbone.MozuView.prototype.render.call(this);
         }
        
    });
    $(document).ready(function() {
        //firfox radio button  caching fix.
        
        $("input[type='radio']:first").prop("checked", "checked");
        var QOModel = Backbone.MozuModel.extend({});
        var orderobj = {
            orderStaus: function() {
                var self = this;
                api.request('GET', 'api/commerce/orders/?startIndex=0&pageSize=5&filter=status+eq+Completed&sortBy=submittedDate desc').then(function(resp) {
                    if(resp.items.length) {
                        api.request("post","/rof/get_coldpackDetails",{data:resp,customerId:require.mozuData('user').accountId}).then(function(productDetails){
                            getProductDates(productDetails.data,self.dateCallBack);
                        }).catch(function(e) { 
                        }).then(function() {
                        });
                    } else {
                        getProductDates(resp,self.dateCallBack);
                    }
                        // console.log(resp.items);
                        // var items = resp.items;
                        // var itemLength = resp.items.length;
                        // var i;
                        // $.each(items,function(i,v){
                        //     var item = items[i].items;
                        //     // var itemCLength = resp.items.length;
                        //     // var j;
                        //     $.each(item,function(j,v){
                        //         var getProductCode = item[j].product.productCode;
                        //         console.log(getProductCode);
                        //     }); 
                        // });
                        // getProductDates(resp,self.dateCallBack);
                },function(err){
                    console.log(err);
                });
            },
            dateCallBack:function(resp){
                var orderStatus = new orderstatus({
                    el: $('#previousorder'),
                    model: new QOModel(resp)
                });
                orderStatus.render();
            }
        };
        orderobj.orderStaus();
        $(document).on("click", ".mz-toggleicon", function() { 
            var orderNum = $(this).parent().attr("data-mz-ordernumber");
            if($(this).hasClass("plus")){
                $(".mz-toggleicon").removeClass('minus').addClass("plus");
                $(this).removeClass("plus").addClass('minus'); 
                $(".order-slave").hide();
                $(".order-slave[data-mz-ordernumber='"+orderNum+"']").slideDown();
            $(".dsd-btn").attr("disabled",true);
                if($(".magic-checkbox[data-mz-ordernumber='"+orderNum+"']:checked").not('.select-all-check').length>0){
                    $(".dsd-btn[data-mz-ordernumber='"+orderNum+"']").attr("disabled",false);    
                }
            }else{ 
                 $('.desktop input.select-all-check').prop('checked',false).next().trigger('click');
                $(".order-slave[data-mz-ordernumber='"+orderNum+"']").slideUp();        
                
                $(".dsd-btn").attr("disabled",false);  
            $(this).removeClass('minus').addClass("plus");
            } 
            
        });
        $(document).on("click", ".mz-toggleiconmbl", function() { 
            var orderNum = $(this).parent().attr("data-mz-ordernumber");
            if($(this).hasClass("plus")){
                $(".mz-toggleiconmbl").removeClass('minus').addClass("plus");
                $(this).removeClass("plus").addClass('minus'); 
                $(document).find(".order-slaveformbl").hide();
                $(".order-slaveformbl[data-mz-ordernumber='"+orderNum+"']").slideDown();
            $(".dsd-btnformbl").attr("disabled",true);
                if($(".mobile-body .magic-checkbox[data-mz-ordernumber='"+orderNum +"']:checked").not(".select-all-check").length>0){
                    $(".dsd-btnformbl[data-mz-ordernumber='"+orderNum+"']").attr("disabled",false);    
                }
            }else{ 
                
                $(".order-slaveformbl[data-mz-ordernumber='"+orderNum+"']").slideUp();        
                 $('.mobile input.select-all-check').prop('checked',false).next().trigger('click');
                $(".dsd-btnformbl").attr("disabled",false);  
            $(this).removeClass('minus').addClass("plus");
            } 
            
        });

    var getProductDates = function(res,callback){
        var ordersLen =  res.items.length,i=0,productCodes=[];
        var fetchData = [];
        for(i;i<ordersLen;i++){
            var itemsLen = res.items[i].items.length,j=0;

            for(j;j<itemsLen;j++){
                var code = res.items[i].items[j].product.productCode;
                if(productCodes.length>0 && productCodes.indexOf(code)<0){
                    fetchData.push({"productCode": code,quantity:1 });
                    productCodes.push(code);
                }else if(productCodes.length<1){
                    fetchData.push({"productCode": code,quantity:1 });
                    productCodes.push(code);
                }
            }
        }
        console.log(fetchData);
        console.log("silpa");
        if(productCodes.length>0){
            api.request("post","/sfo/get_dates",{data:productCodes}).then(function(resp) {
                var d =  assignFutureDates(res,resp);
                callback(d);
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
                    var isHeatSensitive = _.find(orders.items[i].items[j].properties, function(property) {
                        if (property.attributeFQN === "tenant~isheatsensitive" || property.attributeFQN === "tenant~IsHeatSensitive") {
                            return property.values[0].value;
                        }
                    }); 
                    if(isHeatSensitive && Hypr.getThemeSetting('heatSensitive')){
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
        var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());     
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
        var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());      
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
            var  sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());  
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
    var reviewandPlaceOrderCollapse = function() {
            $('.order-body').slideDown('slow'); 
            $('.place-order').slideUp('slow');
            $('.dsdheader .editchange').hide(function() { 
            $('.dsdheader .collapsed').show();
            //$('.dsdheader .collapsed').show(); 
            $(".dsdcheckoutlabel .collapsed").hide();
            $(".dsdcheckoutlabel .editchange").show(); 
            if($(window).width()<767){
            $(".review-order-container .placeorder").fadeOut(function(){ 
               $(".review-order-container .mobile-checkout").fadeIn();
                });
            }else{
                $(".review-order-container .placeorder").fadeOut(function(){ 
               $(".review-order-container .checkout-button").fadeIn();  
            });    
                }
            });

        };
    // $(document).on("click","button.edit-order", function(){
    //  reviewandPlaceOrderCollapse();   
    // });  
        $(document).on('click', '.dsdmainorders .editchange', function(){
           reviewandPlaceOrderCollapse();   
    });
    });
});


























