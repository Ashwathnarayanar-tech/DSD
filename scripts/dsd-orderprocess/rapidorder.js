require([
    "modules/jquery-mozu", "underscore", "modules/api",
    "hyprlive", "modules/backbone-mozu", 'modules/models-product', 'modules/models-cart',
    "dsd-orderprocess/review-cart","dsd-orderprocess/future-popup"
], function($, _, api, Hypr, Backbone, ProductModels, CartModels, reviewCart,futurePopup) {
    var rapidorder = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/rapidorder",
        additionalEvents: {
            "focusout [data-mz-item] ": "getProduct",
            "click [data-mz-removeitem]": "removeitem",
            "keydown [data-mz-item]": "enterKey",
            'keypress [data-mz-mitem]': 'mblreturn',
            "change [data-mz-qty]": "changeQty",
            "change [data-mz-qty-tab]": "changeQty",
            "click [data-ms-submit]": "mblsubmit",
            "focusout [data-mz-mitem]": "mblsubmit",
            "click .remove-item-mbl": "removemblItem"
        },
        count: 0,
        dsdaddrow: function() {
            var count = 1,
                dsdnewrow = '',
                dsdnewrow_tbl = "";
            if ($(window).width() <= 1024) {
                $(".m-rapidordertable").find($('[data-mz-mitem]')).each(function(key, value) {
                    count = (parseInt(value.getAttribute('dsd-lineitemumber'), 10) > count ? parseInt(value.getAttribute('dsd-lineitemumber'), 10) : count);
                });
                count++;
                dsdnewrow = '';
                dsdnewrow += '<div class="m-rapidinput" dsd-lineitemumber="' + count + '">';
                dsdnewrow += '<input class="roinputportrait" type="tel" data-mz-mitem dsd-lineitemumber="' + count + '"/><button class="btn-submit" data-ms-submit></button>';
                dsdnewrow += '</div>';
                dsdnewrow += '<div class="itemnotfound" data-mz-notfound dsd-lineitemumber="' + count + '"></div>';
                dsdnewrow += '<table style="display:none" class="m-rapidordertable-tbl" id="tblportriat" dsd-lineitemumber="' + count + '">';
                dsdnewrow += '<tr class="mcoded">';
                dsdnewrow += '<td data-mz-code dsd-lineitemumber="' + count + '" class="m-code"></td>';
                dsdnewrow += '</tr>';
                dsdnewrow += '<tr class="mcodedesc">';
                dsdnewrow += '<td class="desc" data-mz-prod dsd-lineitemumber="' + count + '" colspan="3" dsd-lineitemumber="' + count + '"><span data-mz-proddesc dsd-lineitemumber="' + count + '"></span><span class="outofstock" data-mz-productCode data-mz-available dsd-lineitemumber="' + count + '"></span><span class="future-date-mob" data-mz-productCode data-mz-future-mob dsd-lineitemumber="' + count + '"></span></td>';
                dsdnewrow += '<td class="remove-item-mbl close" data-mz-close dsd-lineitemumber="' + count + '"><span class="unitclose" dsd-lineitemumber="' + count + '"></span></td>';
                dsdnewrow += '</tr>';
                dsdnewrow += '<tr class="mcodedetails">';
                dsdnewrow += '<td class="unit-price" data-mz-unitprice dsd-lineitemumber="' + count + '"></td>';
                dsdnewrow += '<td class="coldpack" data-mz-coldpack dsd-lineitemumber="' + count + '"><span class="coldpack"></span></td>';
                dsdnewrow += '<td class="qty"> <select data-mz-qty-tab data-mz-stock dsd-lineitemumber="' + count + '"><option value="1">1</option>  <option value="2">2</option> <option value="3">3</option> <option value="4">4</option></select> </td>';
                dsdnewrow += '<td class="price" data-mz-totalprice dsd-lineitemumber="' + count + '"></td>';
                dsdnewrow += '</tr>';
                dsdnewrow += '</table>';

                $('.m-rapidordertable').append(dsdnewrow);
            } else {
                count = 1;
                $("#rapidtable").find($('[data-mz-item]')).each(function(key, value) {
                    count = (parseInt(value.getAttribute('dsd-lineitemumber'), 10) > count ? parseInt(value.getAttribute('dsd-lineitemumber'), 10) : count);
                });
                count++;

                dsdnewrow += '<tr>';
                dsdnewrow += '<td class="ro-item"><input class="roinput" type="text" data-mz-item dsd-lineitemumber="' + count + '"/></td>';
                dsdnewrow += '<td class="ro-name"><span data-mz-name dsd-lineitemumber="' + count + '"></span><span class="outofstock" data-mz-available="" dsd-lineitemumber="' + count + '"></span><span class="future-date" data-mz-productCode data-mz-future dsd-lineitemumber="' + count + '"></span></td>';
                dsdnewrow += '<td class="ro-price"><span  data-mz-price dsd-lineitemumber="' + count + '" value=""></span></td>';
                dsdnewrow += '<td class="ro-colditem"><span data-mz-colditem dsd-lineitemumber="' + count + '"></span></td>';
                dsdnewrow += '<td class="ro-qty"> <select disabled data-mz-qty data-mz-stock dsd-lineitemumber="' + count + '"><option value="1">1</option>  <option value="2">2</option> <option value="3">3</option> <option value="4">4</option> </td>';
                dsdnewrow += '<td class="ro-linetotal"><span data-mz-total dsd-lineitemumber="' + count + '"></span>  <span class="ro-removeitem" dsd-lineitemumber="' + count + '"  data-mz-removeitem></span></td>';
                dsdnewrow += '</tr>';
                $('#rapidtable').append(dsdnewrow);
            }
        },
        removemblItem: function(eve) { 
            var lineItemNum = $(eve.currentTarget).attr('dsd-lineitemumber');
            //$("#rapidorder-subtotal").html("");
            $('.m-rapidordertable-tbl[dsd-lineitemumber="' + lineItemNum + '"]').hide();
            $('.m-rapidinput[dsd-lineitemumber="' + lineItemNum + '"]').show();
            $('.roinputportrait[dsd-lineitemumber="' + lineItemNum + '"]').val("");
            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-future-mob][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("avalible");
            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("notAvalible");
            // $(".outofstock[data-mz-productcode='"+product.productcode.trim()+"']").empty().attr("data-mz-productcode","");  
            this.calculteTotals();
        },
        //Portrait Functionality
        mblsubmit: function(eve) {
            eve.preventDefault();
            var self = this;
            var lineItemNum, productId,optionsHtml,optionsHtml1,lineNumber,str;
            if ($(eve.currentTarget).val().length > 0) {
                productId = $(eve.currentTarget).val();
                lineItemNum = $(eve.currentTarget).attr('dsd-lineitemumber');
            } else if ($(eve.currentTarget).siblings().val().length > 0) {
                productId = $(eve.currentTarget).siblings().val();
                lineItemNum = $(eve.currentTarget).siblings().attr('dsd-lineitemumber');
            }
            if (productId) {
                var existingLineItem = $('.m-rapidordertable').find('.m-code[prodid="'+productId+'"]').filter(':visible');
              if (existingLineItem && existingLineItem.length>0) {
                    window.testmydata(lineItemNum,"same");
                    if(parseInt(existingLineItem.parents('tbody').find('.mcodedetails .qty').find('select').val(),10) < 4){
                        $('[data-mz-notfound][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM ALREADY EXISTS</span>").fadeIn(2000, function() {
                            $('[data-mz-notfound][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>ITEM ALREADY EXISTS</span>").fadeOut(1000);
                            $('html, body').animate({
                                scrollTop:  existingLineItem.offset().top-50
                            }, 1000);
                            $('[data-mz-mitem][dsd-lineitemumber="' + lineItemNum + '"]').val(''); 
                        });
                    }else{
                        $('[data-mz-notfound][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>Maximum quantity of any item is 4 per order. If you need more, <a href='/contactus' target='_blank' style='color:#0080b7; text-decoration:underline'>Contact Us.</a></span>").fadeIn(2000, function() {
                            $('[data-mz-notfound][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>Maximum quantity of any item is 4 per order. If you need more, <a href='/contactus' target='_blank' style='color:#0080b7; text-decoration:underline'>Contact Us.</a></span>")
                            .delay(5000).fadeOut(1000,function(){
                                 $('[data-mz-mitem][dsd-lineitemumber="' + lineItemNum + '"]').val(''); 
                            });
                        });
                    }    
                }else{  
                    window.testmydata(lineItemNum,"next"); 
                    api.request("post","/rof/get_dates",{data:productId,customerId:require.mozuData('user').lastName,site:"dsd"}).then(function(productDetails){
                        if(productDetails==="item not found"){
                            self.removerow(lineItemNum);
                                lineNumber = parseInt($(document).find('.m-rapidordertable').find('.m-rapidinput').last().attr('dsd-lineitemumber'),10);
								str = '<div class="m-rapidinput" dsd-lineitemumber="'+(lineNumber+1)+'"><input class="roinputportrait" type="tel" data-mz-mitem data-mz-action="mblreturn"  dsd-lineitemumber="'+(lineNumber+1)+'"/><button class="btn-submit" data-ms-submit></button>';
                                str += '</div><div class="itemnotfound" data-mz-notfound dsd-lineitemumber="'+(lineNumber+1)+'"></div><table class="m-rapidordertable-tbl" id="tblportriat" dsd-lineitemumber="'+(lineNumber+1)+'" style="display: none;">';
                                str += '<tbody><tr class="mcoded"><td data-mz-code dsd-lineitemumber="'+(lineNumber+1)+'" class="m-code"></td></tr><tr class="mcodedesc"><td class="desc" data-mz-prod dsd-lineitemumber="'+(lineNumber+1)+'" colspan="3"><span data-mz-proddesc dsd-lineitemumber="'+(lineNumber+1)+'"></span>';
                                str += '<span class="outofstock" data-mz-productCode data-mz-available dsd-lineitemumber="'+(lineNumber+1)+'"></span></td><td class="remove-item-mbl close" data-mz-close dsd-lineitemumber="'+(lineNumber+1)+'"><span class="unitclose" dsd-lineitemumber="'+(lineNumber+1)+'"></span></td>';
                                str += '</tr><tr class="mcodedetails"><td class="unit-price" data-mz-unitprice dsd-lineitemumber="'+(lineNumber+1)+'"></td><td class="coldpack" data-mz-coldpack dsd-lineitemumber="'+(lineNumber+1)+'"><span class="coldpack"></span></td><td class="qty"  dsd-lineitemumber="'+(lineNumber+1)+'">';
                                str += '<select data-mz-qty-tab data-mz-stock dsd-lineitemumber="'+(lineNumber+1)+'"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></td><td class="price" data-mz-totalprice dsd-lineitemumber="'+(lineNumber+1)+'"></td>';
                                str += '</tr></tbody></table>';
                                $(document).find('.m-rapidordertable').append(str);
                            $('[data-mz-notfound][dsd-lineitemumber="' + (parseInt(lineItemNum,10)+1) + '"]').css({  
                            }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeIn(500, function() { 
                                setTimeout(function(){$('[data-mz-notfound][dsd-lineitemumber="' + (parseInt(lineItemNum,10)+1) + '"]').html("");},1000);
                            });  
                        }else{
                            var futureDate,
                                stockavaillabel = (productDetails.data.inventoryInfo.manageStock) ? productDetails.data.inventoryInfo.onlineStockAvailable : 4,
                                isHeatSensitive = productDetails.data.isHeatSensitiveEnable;
                            if(productDetails.data.futureDate.FirstShipDate){  
                                if (isHeatSensitive ) {
                                    futureDate = self.heatSensitvieDate(productDetails.data.futureDate.FirstShipDate,productDetails.data.futureDate.BlackoutDates);
                                }else{
                                   futureDate = self.availableDate(productDetails.data.futureDate.FirstShipDate,productDetails.data.futureDate.BlackoutDates);
                                }
                            }else{
                                futureDate={fDate:false};
                            }
                            $('[data-mz-code][dsd-lineitemumber="' + lineItemNum + '"]').html("Item #<strong>"+productId+"</strong>");
                            $('[data-mz-code][dsd-lineitemumber="' + lineItemNum + '"]').attr('prodId', productId);
                            $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').val(1);
                            $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').attr("disabled", false);
                            //  $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').css("cursor", "auto");
                            $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').attr('disabled', false);
                            if (stockavaillabel > 0) {
                                var style = $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').html(productDetails.data.content.productName);
                                style.css("color", "black").show();
                            } else {
                                var style2 = $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').html(productDetails.data.content.productName);
                                style2.css("color", "red").show();
                                  $('[data-mz-code][dsd-lineitemumber="' + lineItemNum + '"]').find('strong').css("color","red");
                            }
                            //$(".dsdselect[dsd-lineitemumber='"+lineItemNum+"']").prop("disabled",false);
                            $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                            if (stockavaillabel > 0 && !futureDate.fDate) {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Available to ship");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "#00a3e0");
                                $('.outofstock[dsd-lineitemumber="' + lineItemNum + '"]').attr('data-mz-productcode', productDetails.data.productCode);
                                $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "black").parents("tr").css("color", "black");
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').addClass("avalible");
                                $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", productDetails.data.price.price);
                                // $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red").parents("tr").css("color","black");
                                if (stockavaillabel < 4) {
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockavaillabel + " in stock. ");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                    optionsHtml = [];
                                    for (var i = 1; i <= stockavaillabel; i++) {
                                        var sel = (i == 1) ? 'selected' : '';
                                        optionsHtml.push("<option value='" + i + "' " + sel + ">" + i + "</option>");
                                    }
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml.join());
        
                                } else if (stockavaillabel >= 4) {
                                    optionsHtml1 = [];
                                    for (var j = 1; j <= 4; j++) { 
                                        var sele = (j == 1) ? 'selected' : '';
                                        optionsHtml1.push("<option value='" + j + "' " + sele + ">" + j + "</option>");
                                    }
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml1.join());
                                }
                            }else if (stockavaillabel > 0 && futureDate.fDate) {
                                $('[data-mz-future-mob][dsd-lineitemumber="' + lineItemNum + '"]').html("Available on "+futureDate.date+" "+"<span class='or-text'>or</span><p class='notify'>Notify Me</p>");
                                $('.outofstock[dsd-lineitemumber="' + lineItemNum + '"]').attr('data-mz-productcode', productDetails.data.productCode);
                                $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').css({"color":"black","font-weight":'bold'}).parents("tr").css("color", "black");
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').addClass("avalible");
                                $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", productDetails.data.price.price);
                                // $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red").parents("tr").css("color","black");
                                if (stockavaillabel < 4) {
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockavaillabel + " in stock. ");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                    optionsHtml = [];
                                    for (var k = 1; k <= stockavaillabel; k++) {
                                        var selk = (k == 1) ? 'selected' : '';
                                        optionsHtml.push("<option value='" + k + "' " + selk + ">" + k + "</option>");
                                    }
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml.join());
        
                                } else if (stockavaillabel >= 4) {
                                    optionsHtml1 = [];
                                    for (var l = 1; l <= 4; l++) {
                                        var select = (l == 1) ? 'selected' : '';
                                        optionsHtml1.push("<option value='" + l + "' " + select + ">" + l + "</option>");
                                    }
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml1.join());
                                }
                            }else {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("This item is out of stock. <p class='notify'>Notify Me</p>");
                                $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red").parents("tr").css("color", "lightgrey");
                                $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + 0.00);
                                $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                                $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').attr("disabled", "disabled");
                                //$('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').css("cursor", "not-allowed");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", "0");
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + 0.00);
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').addClass("notAvalible");
                                $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').css('color',"red");
                            }
                            $('[data-mz-stock][dsd-lineitemumber="' + lineItemNum + '"]').attr('data-mz-stock', stockavaillabel);
                            
                            if(stockavaillabel > 0){
                                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * 1);
                            }
                            if (isHeatSensitive) {
                                $('[data-mz-coldpack][dsd-lineitemumber="' + lineItemNum + '"]').html('<div class="coldpack"><span class="coldspan">Cold Pack</span></div>');
                            } else {
                                $('[data-mz-coldpack][dsd-lineitemumber="' + lineItemNum + '"]').html("");
                            }
                            //$('[dsd-lineitemumber="'+ lineItemNum +'"]').hide();
                            //$('[dsd-lineitemumber="'+ lineItemNum +'"]').hide();
                            $('.m-rapidordertable-tbl[dsd-lineitemumber="' + lineItemNum + '"]').show();
                            // $('.m-rapidinput[dsd-lineitemumber="' + lineItemNum + '"]').hide();                       
                            self.autoaddnewline();                       
                                
                        }
                    /* jshint ignore:start */
                    }).catch(function(e) {
                        /* jshint ignore:end */
                        //self.clearall();
                        self.removerow(lineItemNum);
                        // window.testmydata(lineItemNum,"same");
                        // $(".dsdselect[dsd-lineitemumber='"+lineItemNum+"']").prop("disabled",true);
                            lineNumber = parseInt($(document).find('.m-rapidordertable').find('.m-rapidinput').last().attr('dsd-lineitemumber'),10);
                        str = '<div class="m-rapidinput" dsd-lineitemumber="'+(lineNumber+1)+'"><input class="roinputportrait" type="tel" data-mz-mitem data-mz-action="mblreturn"  dsd-lineitemumber="'+(lineNumber+1)+'"/><button class="btn-submit" data-ms-submit></button>';
                            str += '</div><div class="itemnotfound" data-mz-notfound dsd-lineitemumber="'+(lineNumber+1)+'"></div><table class="m-rapidordertable-tbl" id="tblportriat" dsd-lineitemumber="'+(lineNumber+1)+'" style="display: none;">';
                            str += '<tbody><tr class="mcoded"><td data-mz-code dsd-lineitemumber="'+(lineNumber+1)+'" class="m-code"></td></tr><tr class="mcodedesc"><td class="desc" data-mz-prod dsd-lineitemumber="'+(lineNumber+1)+'" colspan="3"><span data-mz-proddesc dsd-lineitemumber="'+(lineNumber+1)+'"></span>';
                            str += '<span class="outofstock" data-mz-productCode data-mz-available dsd-lineitemumber="'+(lineNumber+1)+'"></span></td><td class="remove-item-mbl close" data-mz-close dsd-lineitemumber="'+(lineNumber+1)+'"><span class="unitclose" dsd-lineitemumber="'+(lineNumber+1)+'"></span></td>';
                            str += '</tr><tr class="mcodedetails"><td class="unit-price" data-mz-unitprice dsd-lineitemumber="'+(lineNumber+1)+'"></td><td class="coldpack" data-mz-coldpack dsd-lineitemumber="'+(lineNumber+1)+'"><span class="coldpack"></span></td><td class="qty"  dsd-lineitemumber="'+(lineNumber+1)+'">';
                            str += '<select data-mz-qty-tab data-mz-stock dsd-lineitemumber="'+(lineNumber+1)+'"><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></td><td class="price" data-mz-totalprice dsd-lineitemumber="'+(lineNumber+1)+'"></td>';
                            str += '</tr></tbody></table>';
                            $(document).find('.m-rapidordertable').append(str);
                        $('[data-mz-notfound][dsd-lineitemumber="' + (parseInt(lineItemNum,10)+1) + '"]').css({  
                            //display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeIn(500, function() { 
                        //$('[data-mz-notfound][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeOut(3000);
                            setTimeout(function(){$('[data-mz-notfound][dsd-lineitemumber="' + (parseInt(lineItemNum,10)+1) + '"]').html("");},1000);
                        });  
                    }).then(function() {
                        self.calculteTotals();
                    });
                }    
            } else {
                self.removeitem(eve);
            }
        },
        enterKey: function(e) {
            if (e.keyCode == 13) {
                this.getProduct(e); 
            }else if(e.keyCode == 9 && !e.shiftKey){
                if($(document).find('.roinput').filter(function(e){return this.value ? false : true;}).length <= 0){
                    this.dsdaddrow(); 
                    setTimeout(function(){$($(document).find('.roinput').filter(function(e){return this.value ? false : true;})[0]).focus();},1000);  
                }
            } 
        },
        autoaddnewline: function(e){
            if($(window).width() <= 1024){
                if($(document).find('.roinputportrait').filter(function(e){return this.value ? false : true;}).length <= 0){
                    this.dsdaddrow(); 
                    setTimeout(function(){$($(document).find('.roinputportrait').filter(function(e){return this.value ? false : true;})[0]).focus();},800);  
                }else{
                    setTimeout(function(){$($(document).find('.roinputportrait').filter(function(e){return this.value ? false : true;})[0]).focus();},300);      
                }
            }else{
                if($(document).find('.roinput').filter(function(e){return this.value ? false : true;}).length <= 0){
                    this.dsdaddrow(); 
                    setTimeout(function(){$($(document).find('.roinput').filter(function(e){return this.value ? false : true;})[0]).focus();},800);  
                }else{
                    setTimeout(function(){$($(document).find('.roinput').filter(function(e){return this.value ? false : true;})[0]).focus();},300);     
                }
            }
        }, 
        mblreturn: function(eve) {
            if (eve.keyCode == 13) {
                this.mblsubmit(eve);
                $(eve.currentTarget).blur();
            }
        },
        updateQtyLineItem: function($el) {
            var selectedOption = $el.find('option:selected');
            if ($el.find('option').val() < 4) {
                $el.find('option').removeAttr('selected');
                selectedOption.next().attr('selected', 'selected');
                $el.trigger('change');
            }
        },
        //Portrait Functionality 
        getProduct: function(event) {
            var self = this,optionsHtml,optionsHtml1,selectedQty,selectedQty1;
            if (event.currentTarget.value.trim().length > 0) {
                // event.currentTarget.blur();
                var productId = event.currentTarget.value;
                try {
                  event.currentTarget.parentElement.parentElement.setAttribute("sku",productId);
                } catch (e) { console.log(e); }
                var lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');
                var existingLineItem = $("#rapidtable").find('.ro-name[itemcode="' + productId.toUpperCase() + '"]');
                if (existingLineItem.length > 0 && (event.currentTarget != existingLineItem.prev().find('input')[0])) {
                    if(existingLineItem.nextAll('.ro-qty').find('option:selected').val() < 4){
                        self.removerow(lineItemNum,false);
                        self.calculteTotals();
                        $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM ALREADY EXISTS</span>").fadeIn(1000, function() {
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>ITEM ALREADY EXISTS</span>").fadeOut(1000);
                            $('html, body').animate({
                                scrollTop:  existingLineItem.offset().top-50
                            }, 1000);
                        });
                        if ($(window).width() <= 1024) {
                            $('[data-mz-mitem][dsd-lineitemumber="' + lineItemNum + '"]').val(''); 
                        }else{
                            $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').val('');
                        }
                    }else{
                         $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>Maximum quantity of any item is 4 per order. If you need more, <a href='/contactus' target='_blank' style='color:#0080b7; text-decoration:underline'>Contact Us.</a></span>").fadeIn(1000, function() {
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>Maximum quantity of any item is 4 per order. If you need more, <a style='color:#0080b7; text-decoration:underline;' href='/contactus' target='_blank'>Contact Us.</a></span>")
                            .delay(5000).fadeOut(1000,function(){
                                if ($(window).width() <= 1024) {
                                    $('[data-mz-mitem][dsd-lineitemumber="' + lineItemNum + '"]').val(''); 
                                }else{
                                    $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').val('');
                                }
                            });
                            
                        });
                    }
                   /* 
                    if(existingLineItem.find('.outofstock').text().toLowerCase().indexOf('available to ship')>-1 && existingLineItem.nextAll('.ro-qty').find('option:selected').val() < 4){
                        var evObj = existingLineItem.nextAll('.ro-qty').find('select');
                        self.updateQtyLineItem(evObj);     
                    }*/
                    
                   
                   
                    /*  if (existingLineItem.nextAll('.ro-qty').find('option:selected').val() < 4) {
                        var evObj = existingLineItem.nextAll('.ro-qty').find('select');
                        //self.changeQty(evObj);
                        self.updateQtyLineItem(evObj);
                        //self.removeitem(event);
                        self.removerow(lineItemNum, true);
                    } else {
                        self.removerow(event.currentTarget.getAttribute('dsd-lineitemumber', true));
                    }*/
                } else {
                    api.request("post","/rof/get_dates",{data:productId,customerId:require.mozuData('user').lastName,site:"dsd"}).then(function(productDetails){
                        if(productDetails==="item not found"){
                            self.removerow(lineItemNum);
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeIn(500, function() {
                            setTimeout(function(){
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html("");},1000);
                            });  
                        }else{
                            var futureDate,
                                stockavaillabel = (productDetails.data.inventoryInfo.manageStock) ? productDetails.data.inventoryInfo.onlineStockAvailable : 4,
                                isHeatSensitive = productDetails.data.isHeatSensitiveEnable;
                            if(productDetails.data.futureDate.FirstShipDate){    
                                if (isHeatSensitive) {
                                    futureDate = self.heatSensitvieDate(productDetails.data.futureDate.FirstShipDate,productDetails.data.futureDate.BlackoutDates);
                                }else{
                                   futureDate = self.availableDate(productDetails.data.futureDate.FirstShipDate,productDetails.data.futureDate.BlackoutDates);
                                }
                            }else{
                                futureDate =  {fDate:false};
                            }
                            
                            $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').val(productId);
                            $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').val(); // Changed value from 1 to default.
                            $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').attr("disabled", false);
                            //$('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').css("cursor", "auto"); 
                            $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').attr('disabled', false);
                            if (stockavaillabel > 0 && !futureDate.fDate) {
                                var style = $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html(productDetails.data.content.productName);
                                style.css("color", "black").show();
                            } else {
                                var style2 = $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html(productDetails.data.content.productName);
                                style2.css("color", "red").show();
                            }
                            //$(".dsdselect[dsd-lineitemumber='"+lineItemNum+"']").prop("disabled",false);
                            $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                            if (stockavaillabel > 0 && !futureDate.fDate) {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Available to ship");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "#00a3e0");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "black").parents("tr").css("color", "black");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').parent().attr('itemcode', productDetails.data.productCode);
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').addClass("avalible");
                                $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", productDetails.data.price.price);
                                // $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red").parents("tr").css("color","black");
                                if (stockavaillabel < 4) {
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockavaillabel + " in stock. ");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                    optionsHtml = [];
                                    for (var i = 1; i <= stockavaillabel; i++) {
                                        var sel = (i == 1) ? 'selected' : '';
                                        optionsHtml.push("<option value='" + i + "' " + sel + ">" + i + "</option>");
                                    }
                                    selectedQty = $('select[dsd-lineitemumber="' + lineItemNum + '"]').val();
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml.join());
                                    if (selectedQty < stockavaillabel) {
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option').removeAttr('selected');
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option[value="selectedQty"]').attr('selected', true);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').val(selectedQty);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').trigger('change');
                                    }
                                } else if (stockavaillabel >= 4) {
                                    optionsHtml1 = [];
                                    for (var j = 1; j <= 4; j++) {
                                        var sele = (j == 1) ? 'selected' : '';
                                        optionsHtml1.push("<option value='" + j + "' " + sele + ">" + j + "</option>");
                                    }
                                    selectedQty1 = $('select[dsd-lineitemumber="' + lineItemNum + '"]').val();
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml1.join());
                                    if (selectedQty1 > 1) {
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option').removeAttr('selected');
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option[value="' + selectedQty1 + '"]').attr('selected', true);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').val(selectedQty1);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').trigger('change');
                                    }
                                } 
                            }else if(stockavaillabel > 0 && futureDate.fDate){
                                $('[data-mz-future][dsd-lineitemumber="' + lineItemNum + '"]').html("Available on "+futureDate.date+" "+"<span class='or-text'>or</span><p class='notify'>Notify Me</p>");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css({"color":"black",'font-weight':'bold'}).parents("tr").css("color", "black");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').parent().attr('itemcode', productDetails.data.productCode);
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value" + productDetails.data.price.price.toFixed(2));
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').addClass("avalible");
                                $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", productDetails.data.price.price);
                                // $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red").parents("tr").css("color","black");
                                if (stockavaillabel < 4) {
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockavaillabel + " in stock. ");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                    optionsHtml = [];
                                    for (var k = 1; k <= stockavaillabel; k++) {
                                        var selk = (k == 1) ? 'selected' : '';
                                        optionsHtml.push("<option value='" + k + "' " + selk + ">" + k + "</option>");
                                    }
                                    selectedQty = $('select[dsd-lineitemumber="' + lineItemNum + '"]').val();
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml.join());
                                    if (selectedQty < stockavaillabel) {
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option').removeAttr('selected');
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option[value="selectedQty"]').attr('selected', true);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').val(selectedQty);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').trigger('change');
                                    }
                                } else if (stockavaillabel >= 4) {
                                    optionsHtml1 = [];
                                    for (var l = 1; l <= 4; l++) {
                                        var select = (l == 1) ? 'selected' : '';
                                        optionsHtml1.push("<option value='" + l + "' " + select + ">" + l + "</option>");
                                    }
                                    selectedQty1 = $('select[dsd-lineitemumber="' + lineItemNum + '"]').val();
                                    $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml1.join());
                                    if (selectedQty1 > 1) {
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option').removeAttr('selected');
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').find('option[value="' + selectedQty1 + '"]').attr('selected', true);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').val(selectedQty1);
                                        $('select[dsd-lineitemumber="' + lineItemNum + '"]').trigger('change');
                                    }
                                } 
                            }else {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("This item is out of stock. <p class='notify'>Notify Me</p>");
                                // $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("This item is out of stock");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red").parents("tr").css("color", "lightgrey");
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + 0.00);
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').addClass("notAvalible");
                                $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').attr("disabled", "disabled");
                                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').parent().attr('itemcode', productDetails.data.productCode);
                                //  $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').css("cursor", "not-allowed");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                                $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').css('color',"red");
                            }
                            $('[data-mz-stock][dsd-lineitemumber="' + lineItemNum + '"]').attr('data-mz-stock', stockavaillabel);
                            $('[data-mz-removeitem][dsd-lineitemumber="' + lineItemNum + '"]').text("Remove Item");
                            
                            if(stockavaillabel > 0){
                                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * 1);
                            }
                            if (isHeatSensitive ) {
                                $('[data-mz-colditem][dsd-lineitemumber="' + lineItemNum + '"]').html('<div class="coldpack"><img src="../resources/images/coldpack-tick.png" alt="Yes"></div>');
                            } else {
                                $('[data-mz-colditem][dsd-lineitemumber="' + lineItemNum + '"]').html("");
                            }
                            self.autoaddnewline();
                        }        
                         
                        /* jshint ignore:start */
                    }).catch(function(e) { 
                        /* jshint ignore:end */
                        //self.clearall();
                        self.removerow(lineItemNum);
                        // $(".dsdselect[dsd-lineitemumber='"+lineItemNum+"']").prop("disabled",true);
                        $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css({
                            //display: "none"
                        }).html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeIn(500, function() {
                            //$('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html("<span style='color: #ff0000; font-weight: bold;'>ITEM NOT FOUND</span>").fadeOut(3000);
                            setTimeout(function(){$('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html("");},1000);
                        });
                    }).then(function() {
                        self.calculteTotals();
                    });
                }

            } else {
                self.removeitem(event);
            }
        },
        formatDate: function(date) {
            var udate = new Date(date);
            var sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()); 	
            // sdate.setUTCHours(new Date().getUTCHours());
            // var hours = sdate.getHours();
            // if(hours >= 12){ 
            //     sdate.setDate(sdate.getDate()+1);
            // }
            return ('0'+(sdate.getMonth()+1)).slice(-2)+ '/' + ('0'+sdate.getDate()).slice(-2) + '/' + sdate.getFullYear();
        },
        availableDate:function(fdate,BlackoutDates){
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
            var sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear()); 	    
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
        getMonth:function(month){
            var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
            return months[month];
        },
        changeQty: function(event) {
            var self = this;
            var quantity, stockCount, lineItemNum, optionsHtml, i, sel;
            if ($(window).width() <= 1024) {
                if ($(event.currentTarget).parent().parent().find('.roinputportrait').val() !== "") {
                    quantity = event.currentTarget.value;
                    stockCount = event.currentTarget.getAttribute('data-mz-stock');
                    lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');
                    if ($('[data-mz-proddesc ][dsd-lineitemumber="' + lineItemNum + '"]').html() !== "") {
                        if (parseInt(quantity, 10) > parseInt(stockCount, 10)) {
                            //$('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red");
                            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("This item is out of stock.");
                            $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red").parents("tr").css("color", "lightgrey");
                            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + 0.00);
                            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                            $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').css('color',"red");
                        } else {
                            if (stockCount > 0 && stockCount < 4) {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockCount + " in stock");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                            } else {
                                if($('[data-mz-future-mob][dsd-lineitemumber="' + lineItemNum + '"]').html().length<1){
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Available to ship");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "#00a3e0");
                                }
                            }
                            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + ($('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * quantity).toFixed(2));
                            $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * quantity);
                            $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').parents("tr").css("color", "initial");
                            $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "initial");
                        }
                        self.calculteTotals();
                    } else {
                        alert("Item does not exist.");
                    }
                }
            } else {
                if ($(event.currentTarget).parent().parent().find('.roinput').val() !== "") {
                    quantity = event.currentTarget.value;
                    stockCount = event.currentTarget.getAttribute('data-mz-stock');
                    lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');
                    if ($('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html() !== "") {
                        if (parseInt(quantity, 10) > parseInt(stockCount, 10)) {
                            //$('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color","red");
                            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("This item is out of stock.");
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red").parents("tr").css("color", "lightgrey");
                            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + 0.00);
                            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red");
                            $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').css('color',"red");

                        } else {
                            if (stockCount > 0 && stockCount < 4) {
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Only " + stockCount + " in stock");
                                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "red"); 
                                // optionsHtml = [];
                                // for (i = 1; i <= stockCount; i++) {
                                //     sel = (i == stockavaillabel) ? 'selected' : '';
                                //     optionsHtml.push("<option value='" + i + "' " + sel + ">" + i + "</option>");
                                // }
                                // $('select[dsd-lineitemumber="' + lineItemNum + '"]').html(optionsHtml.join());
                            } else {
                                if($('[data-mz-future][dsd-lineitemumber="' + lineItemNum + '"]').html().length<1){
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html("Available to ship");
                                    $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "#00a3e0");
                                }
                            }
                            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + ($('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * quantity).toFixed(2));
                            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * quantity);
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').parents("tr").css("color", "initial");
                            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').css("color", "initial");

                        }
                        self.calculteTotals();
                    } else {
                        alert("Item does not exist.");
                    }
                }
            }
        },
        removeitem: function(event) {
            var lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');
            $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').val('');
            $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').val(1);
            $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').attr('disabled', true);
            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').parent().attr('itemcode', '');
            $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-saleprice][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-colditem][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-future][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-removeitem][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html('');
            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("avalible");
            $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("notAvalible");
            this.calculteTotals();
        },
        removerow: function(lineItemNum, resetRow) {
            if ($(window).width() <= 1024) {
                $('[data-mz-mitem][dsd-lineitemumber="' + lineItemNum + '"]').val('');
                $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').val(1);
                $('[data-mz-qty-tab][dsd-lineitemumber="' + lineItemNum + '"]').attr('disabled', true);
                $('[data-mz-proddesc][dsd-lineitemumber="' + lineItemNum + '"]').html('');

                $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-colditem][dsd-lineitemumber="' + lineItemNum + '"]').html('');

                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-future-mob][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-close][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("avalible");
                $('[data-mz-totalprice][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("notAvalible");
                if (resetRow) {
                    $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').parents('tr').slideUp();
                    this.dsdaddrow();
                }
            } else {
                $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').val('');
                $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').val(1);
                $('[data-mz-qty][dsd-lineitemumber="' + lineItemNum + '"]').attr('disabled', true);
                $('[data-mz-name][dsd-lineitemumber="' + lineItemNum + '"]').html('');

                $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-saleprice][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-colditem][dsd-lineitemumber="' + lineItemNum + '"]').html('');

                $('[data-mz-available][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-future][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-removeitem][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html('');
                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", 0);
                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("avalible");
                $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').removeClass("notAvalible");
                if (resetRow) {
                    $('[data-mz-item][dsd-lineitemumber="' + lineItemNum + '"]').parents('tr').slideUp();
                    this.dsdaddrow();
                }
            }
        },
        clearall: function() {
            if ($(window).width() <= 1024) {
                $(".m-rapidordertable-tbl").each(function(key, v) {
                    //var lineItemNum = value.getAttribute('dsd-lineitemumber');
                    if($(v).find('.mcodedesc .outofstock').text().indexOf('Maximum quantity of any item is 4 per order. If you need more,')<0){
                        var lineNum = $(v).attr('dsd-lineitemumber');
                        $(v).find('[data-mz-future-mob]').empty();
                        $(v).find('.m-code').attr('prodid','');
                        $(v).find('.m-code').find('strong').empty();
                        $(v).find('.mcodedesc [data-mz-proddesc]').empty();
                        $(v).find('.mcodedesc .outofstock').empty();
                        $(v).find('.mcodedetails .unit-price').empty().attr('value',0);
                        $(v).hide();
                         $(document).find('.m-rapidinput[dsd-lineitemumber='+lineNum+']').find('input').val('');
                        $(v).find('[data-mz-totalprice]').empty();
                        $(v).find('[data-mz-totalprice]').attr("value", 0);
                        $(document).find('.m-rapidinput[dsd-lineitemumber='+lineNum+']').show();
                        $(v).find('[data-mz-totalprice]').removeClass("avalible");
                        $(v).find('[data-mz-totalprice]').removeClass("notAvalible");
                    }
                });
                

            } else {
                $(document).find('.rapidorder-table tr').each(function(i,v){
                    if($(v).find('[data-mz-available]').text().indexOf('Maximum quantity of any item is 4 per order. If you need more,')<0){
                        $(v).find('[data-mz-item]').val('');
                        $(v).find('[data-mz-qty]').val(1);
                        $(v).find('[data-mz-qty]').attr('disabled', true);
                        $(v).find('[data-mz-name]').empty();
                        $(v).find('[data-mz-price]').empty();
                        $(v).find('[data-mz-price]').removeAttr("style");
                        $(v).find('[data-mz-saleprice]').empty();
                        $(v).find('[data-mz-colditem]').empty();
                        $(v).find('[data-mz-available]').empty();
                        $(v).find('[data-mz-future]').empty();
                        $(v).find('[data-mz-removeitem]').empty();
                        $(v).find('[data-mz-total]').empty();
                        $(v).find('[data-mz-total]').attr("value", 0);
                        $(v).find('.ro-name').attr('itemcode','');
                        $(v).find('[data-mz-total]').removeClass("avalible");
                        $(v).find('[data-mz-total]').removeClass("notAvalible");
                    }
                });
            }

            this.calculteTotals();
            // $("#rapidorder-subtotal").html("$"+ 0.00);
        },
        clearList:function(){
            if ($(window).width() <= 1024) {
                $(".m-rapidordertable-tbl").each(function(key, value) {
                    //var lineItemNum = value.getAttribute('dsd-lineitemumber');
                    $('#rapidorder [data-mz-future-mob]').empty();
                    $('.m-rapidordertable-tbl').hide();
                    $('.m-rapidinput input').val('');
                    $('#rapidorder [data-mz-totalprice]').empty();
                    $('#rapidorder [data-mz-totalprice]').attr("value", 0);
                    $('.m-rapidinput').show();
                    $('#rapidorder [data-mz-totalprice]').removeClass("avalible");
                    $('#rapidorder [data-mz-totalprice]').removeClass("notAvalible");
                });
                $('.m-code').attr('prodid','');

            } else {
                $('#rapidorder [data-mz-item]').val('');
                $('#rapidorder [data-mz-qty]').val(1);
                $('#rapidorder [data-mz-qty]').attr('disabled', true);
                $('#rapidorder [data-mz-name]').empty();
                $('#rapidorder [data-mz-price]').empty();
                $('#rapidorder [data-mz-price]').removeAttr("style");
                $('#rapidorder [data-mz-saleprice]').empty();
                $('#rapidorder [data-mz-colditem]').empty();
                $('#rapidorder [data-mz-available]').empty();
                $('#rapidorder [data-mz-future]').empty();
                $('#rapidorder [data-mz-removeitem]').empty();
                $('#rapidorder [data-mz-total]').empty();
                $('#rapidorder [data-mz-total]').attr("value", 0);
                $('.ro-name').attr('itemcode','');
                $('#rapidorder [data-mz-total]').removeClass("avalible");
                $('#rapidorder [data-mz-total]').removeClass("notAvalible");
            }
            this.calculteTotals();
        },
        calculteTotals: function() {
            var subtotal, subtotalmbl, linenumber;
            if ($(window).width() <= 1024) {
                subtotalmbl = 0.00;
                linenumber = 0;
                $('.m-rapidordertable-tbl').find("[data-mz-totalprice]").each(function(key, value) {
                    if($(this).hasClass("avalible")){
                        linenumber++; 
                    }
                    if (value.getAttribute('value')) {
                        if (value.getAttribute('value').length > 0) {
                            subtotalmbl = subtotalmbl + parseFloat(value.getAttribute('value'));
                        }
                    }
                });
                if (subtotalmbl > 0 || linenumber > 0) {
                    $('.dsdallproduct').attr('disabled', false);
                    $(".dsdclearlist").show();
                } else {
                    $(".dsdclearlist").hide();
                    $('.dsdallproduct').attr('disabled', true);
                }
                $('#rapidorder-subtotal').html("Total: &nbsp; $" + subtotalmbl.toFixed(2));
            } else {
                subtotal = 0.00;
                linenumber = 0;
                $('#rapidtable').find("[data-mz-total]").each(function(key, value) {
                    if($(this).hasClass("avalible")){
                        linenumber++; 
                    }
                    if (value.getAttribute('value')) {
                        if (value.getAttribute('value').length > 0) {
                            subtotal = subtotal + parseFloat(value.getAttribute('value'));
                        }
                    }
                });
                if (subtotal > 0 || linenumber > 0) {
                    $('.dsdallproduct').attr('disabled', false);
                    $(".dsdclearlist").show();
                } else {
                    $(".dsdclearlist").hide();
                    $('.dsdallproduct').attr('disabled', true);
                }
                $('#rapidorder-subtotal').html("Total: &nbsp;  &nbsp;$" + subtotal.toFixed(2));
            }
        },
        addalltocart: function() {
            $("body").find(".overlay-full-width").show(); var me=this;
            var futureDates = me.getSelectedProductDates();
            if(futureDates.dates){
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.gettingProductsData();
                    } else {
                        futurePopup.AlertView.closepopup();
                         $("body").find(".overlay-full-width").hide();
                    }
                });
            }else{
                me.gettingProductsData();
            }
        },
        getSelectedProductDates:function(){
            var productDates = [],fDate,date,count=0;
            if ($(window).width() <= 1024) {
                $(".m-rapidordertable").find('[data-mz-mitem]').each(function(key, value) {
                    var productObj = {},date,name;
                    if (value.value.length > 0) {
                        count++;
                        var lin = value.getAttribute('dsd-lineitemumber');
                        date = $('[data-mz-future-mob][dsd-lineitemumber="' + lin + '"]').text().trim().length;
                         if(date>5){
                            date = $('[data-mz-future-mob][dsd-lineitemumber="' + lin + '"]').text().split(' ')[2].concat($('[data-mz-future-mob][dsd-lineitemumber="' + lin + '"]').text().split(' ')[3]);
                            name =  $('[data-mz-proddesc][dsd-lineitemumber="' + lin + '"]').text();
                            productObj = {
                                name: name,
                                date: date 
                            };
                            productDates.push(productObj);
                        }
                    }
                });
            } else {
                $("#rapidtable").find('[data-mz-item]').filter(':visible').each(function(key, value) {
                    var productObj = {}, date, name;
                    if (value.value.length > 0) {
                        count++;
                        var lin = value.getAttribute('dsd-lineitemumber');
                        date = $('[data-mz-future][dsd-lineitemumber="' + lin + '"]').text().trim().length;
                        if(date>5){
                            date = $('[data-mz-future][dsd-lineitemumber="' + lin + '"]').text().split(' ')[2].concat($('[data-mz-future][dsd-lineitemumber="' + lin + '"]').text().split(' ')[3]);
                            name =  $('[data-mz-name][dsd-lineitemumber="' + lin + '"]').text();
                            productObj = {
                                name: name,
                                date: date 
                            };
                            productDates.push(productObj);
                        }
                    }
                }); 
            }
            if(productDates.length === 1 && count=== 1) {
                    fDate = new Date(productDates[0].date);
                    date  = ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear();
                    return {dates:true,btn:"future-date",
                        message:"This item will be available on "+date+". You can add this itme, but your order will not ship before "+date+". There are no partial shipment."};
            }else if(productDates.length >0 && count>1){
                var earliest = productDates.reduce(function (pre, cur) {
                    return Date.parse(pre.date) < Date.parse(cur.date) ? cur : pre;
                });
                fDate = new Date(earliest.date);
                date  = ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear();
                var  msg = 'You selected items that are  currently unavailable. You can add these items and your order will ship after '+date+', when the "'+earliest.name+'" is available. There are no partial shipments.';
                return {dates:true,message: msg,btn:"future-dates"};
            }else{
                return {dates:false};
            }
        },
        gettingProductsData:function(){
            var producttocart, lin, lineItemNum, self = this,qty;
            if ($(window).width() <= 1024) {
                producttocart = [];
                $(".m-rapidordertable").find($('[data-mz-mitem]')).each(function(key, value) {
                    var productObj = {}, quantity, stock;
                    if (value.value.length > 0) {
                        lin = value.getAttribute('dsd-lineitemumber');
                        quantity = $('[data-mz-qty-tab][dsd-lineitemumber="' + lin + '"]').val();
                        stock =  $('[data-mz-qty-tab][dsd-lineitemumber="' + lin + '"]').attr('data-mz-stock');
                        productObj = {
                            productcode: value.value,
                            quantity: quantity,
                            stock : stock
                        };
                        producttocart.push(productObj);
                        /*qty = event.currentTarget.value;
                        lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');*/
                        qty = quantity;
                        lineItemNum = lin;
                        $('[data-mz-unitprice ][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + ($('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * qty).toFixed(2));
                        $('[data-mz-unitprice ][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-unitprice][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * qty);
                    }
                });
                if (producttocart.length > 0) {
                   // self.makeQuickOrder(producttocart);
                    $('html, body').animate({
                        scrollTop: $('.dropdown').offset().top
                    });
                  self.restrictProductQty(producttocart);
                }
            } else {
                producttocart = [];
                $("#rapidtable").find($('[data-mz-item]')).filter(':visible').each(function(key, value) {
                    var productObj = {}, quantity, stock;
                    if (value.value.length > 0) {
                        lin = value.getAttribute('dsd-lineitemumber');
                        quantity = $('[data-mz-qty][dsd-lineitemumber="' + lin + '"]').val();
                        stock =  $('[data-mz-qty][dsd-lineitemumber="' + lin + '"]').attr('data-mz-stock');
                        productObj = {
                            productcode: value.value,
                            quantity: quantity,
                            stock : stock 
                        };
                        producttocart.push(productObj);
                        //self = this;
                        /*qty = event.currentTarget.value;
                        lineItemNum = event.currentTarget.getAttribute('dsd-lineitemumber');*/
                        qty = quantity;
                        lineItemNum = lin;
                        $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').html("$" + ($('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * qty).toFixed(2));
                        $('[data-mz-total][dsd-lineitemumber="' + lineItemNum + '"]').attr("value", $('[data-mz-price][dsd-lineitemumber="' + lineItemNum + '"]').attr("value") * qty);
                    }
                });
                if (producttocart.length > 0) {
                    //self.makeQuickOrder(producttocart);
                    $('html, body').animate({
                        scrollTop: $('.dsullist').offset().top
                    });
                    self.restrictProductQty(producttocart);
                }
            }
        },
        outOfStock: function(product, current) {
            var cartItems = reviewCart.MiniCart.model.get('items').models;
            var cartItemsLength = reviewCart.MiniCart.model.get('items').models.length;
            var inventoryInfo = current.get('inventoryInfo').onlineStockAvailable;
            var manageStock = current.get('inventoryInfo').manageStock;
            var j = 0;
            var msg;
            var addProduct = {
                available: true,
                msg: ""
            };
            if ((inventoryInfo > 0 && manageStock) || !manageStock) {
                if (cartItemsLength > 0 && parseInt(product.quantity, 10) <= 4) {
                    for (j; j < cartItemsLength; j++) {
                        if (product.productcode.trim() === cartItems[j].get('product').get('productCode')) {
                            if (inventoryInfo < cartItems[j].get('quantity') + parseInt(product.quantity, 10)) {
                                addProduct.available = false;
                                msg = "This item is out of stock.";
                                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').html(msg);
                                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').css({
                                    "color": "red"
                                });
                                //For device other than Desktop.
                                $(".outofstock[data-mz-productcode='" + product.productcode.trim() + "']").html(msg).css("color", "red");
                                return addProduct;
                            } else if (cartItems[j].get('quantity') + parseInt(product.quantity, 10) > 4) {
                                addProduct.available = false;
                                msg = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').html(msg);
                                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').css({
                                    "color": "red"
                                });
                                $(".outofstock[data-mz-productcode='" + product.productcode.trim() + "']").html(msg).css("color", "red");
                                return addProduct;
                            }
                        }
                    }
                    if (inventoryInfo < 4) {
                        msg = "only " + inventoryInfo + " in stock";
                        $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').html(msg);
                        $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').css({
                            "color": "red"
                        });
                        $(".outofstock[data-mz-productcode='" + product.productcode.trim() + "']").html(msg).css("color", "red");
                    } else {
                        //$('.ro-name[itemcode="'+product.productcode.trim()+'"]').find('.outofstock').empty();
                        //$(".outofstock[data-mz-productcode='"+product.productcode.trim()+"']").empty();
                    }
                    return addProduct;
                } else if (parseInt(product.quantity, 10) > 4) {
                    addProduct.available = false;
                    msg = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                    $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').html(msg);
                    $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').css({
                        "color": "red"
                    });
                    $(".outofstock[data-mz-productcode='" + product.productcode.trim() + "']").html(msg).css("color", "red");
                    return addProduct;
                } else if (inventoryInfo >= parseInt(product.quantity, 10) || !manageStock) {
                    if (inventoryInfo < 4) {
                        msg = "only " + inventoryInfo + " in stock";
                        /*$('.ro-name[itemcode="'+product.productcode.trim()+'"]').find('.outofstock').html(msg);
                        $('.ro-name[itemcode="'+product.productcode.trim()+'"]').find('.outofstock').css({"color":"red"});
                        $(".outofstock[data-mz-productcode='"+product.productcode.trim()+"']").html(msg).css("color","red");*/
                    } else {
                        //$('.ro-name[itemcode="'+product.productcode.trim()+'"]').find('.outofstock').empty();
                        //$(".outofstock[data-mz-productcode='"+product.productcode.trim()+"']").empty(); 
                    }
                    return addProduct;
                }
            } else {
                addProduct.available = false;
                msg = "This item is out of stock.";
                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').html(msg);
                $('.ro-name[itemcode="' + product.productcode.trim() + '"]').find('.outofstock').css({
                    "color": "red"
                });
                $(".outofstock[data-mz-productcode='" + product.productcode.trim() + "']").html(msg).css("color", "red");
                return addProduct;
            }
        },
        makeQuickOrder: function(products) {
            var errorArray = [],
                self = this,
                productAdded = 0,
                time = 2000;
            var popuparr = {
                poparr: [],
                successmsg: ''
            };
            var count = products.length,
                popUpmodel;
            if (products.length > 0) {
                $(products).each(function(key, pid) {
                    setTimeout(function() {
                        api.get('product', pid.productcode).then(function(sdkProduct) {
                            var PRODUCT = new ProductModels.Product(sdkProduct.data);
                            var res = self.outOfStock(pid, PRODUCT);
                            if (res.available) {
                                PRODUCT.set({
                                    'quantity': pid.quantity
                                });
                                PRODUCT.addToCart();
                                PRODUCT.on('addedtocart', function(attr) {
                                    productAdded++;
                                    reviewCart.MiniCart.updateReviewCart();
                                    PRODUCT = '';

                                    if (productAdded === count) {
                                        len = count;
                                        self.showMessages(errorArray, productAdded);
                                        popuparr.successmsg = Hypr.getLabel('successatc');
                                        var QOModel = Backbone.MozuModel.extend({});
                                        /* var popUpmodel = new PopupModel({
                                             el: $('.pop-up'),
                                            model: new QOModel(popuparr)
                                             });
                                             
                                         popUpmodel.render();
                                         $(".cart-modalsuccess").show().fadeOut(3000);
                                         $("body").find(".overlay-full-width").hide();*/
                                        setTimeout(function() {
                                            reviewCart.MiniCart.updateReviewCart();
                                            popuparr.successmsg = Hypr.getLabel('successatc');
                                            popUpmodel = new PopupModel({
                                                el: $('.pop-up'),
                                                model: new QOModel(popuparr)
                                            });
                                            popUpmodel.render();
                                            if ($(window).width() < 768) {
                                                $(".pop-up").show();
                                                $(".pop-up .suucess-msg").show();
                                            }
                                            $(".pop-up .suucess-msg").show();
                                            $(".cart-modalsuccess").show();
                                            setTimeout(function() {
                                                $(".pop-up .suucess-msg").hide();
                                                $(".cart-modalsuccess").hide();
                                            }, 2000);
                                            $("body").find(".overlay-full-width").hide();
                                        }, 4000);
                                    }
                                });
                                api.on('error', function(badPromise, xhr, requestConf) {
                                    $("body").find(".overlay-full-width").hide();
                                    productAdded++;
                                    errorArray.push(badPromise.message);
                                    if (productAdded === products.length) {
                                        self.showMessages(errorArray, productAdded);
                                    }
                                });
                            } else if (!res.available) {
                                count--;
                                var QOModel = Backbone.MozuModel.extend({});
                                var popObj = {
                                    prodName: PRODUCT.get('content').get('productName')
                                };
                                popuparr.poparr.push(popObj);

                                if (productAdded === count && productAdded !== 0) {
                                    var len = count;
                                    $(".btn-proceedtocheck").prop('disabled', false);
                                    //popuparr.successmsg =   "You have successfully added " + len + " items to your cart. Click Proceed to checkout to Review & place your order";
                                    popuparr.successmsg = Hypr.getLabel('successatc');
                                    /* popUpmodel = new PopupModel({
                                            el: $('.pop-up'),
                                            model: new QOModel(popuparr)
                                            });
                                        popUpmodel.render();
                                       //$(".pop-up .suucess-msg").show().fadeOut(9000);
                                        $(".cart-modalsuccess").show().fadeOut(3000);
                                        $("body").find(".overlay-full-width").hide();
                                        self.showMessages(errorArray, productAdded);*/
                                    setTimeout(function() {
                                        reviewCart.MiniCart.updateReviewCart();
                                        popuparr.successmsg = Hypr.getLabel('successatc');
                                        popUpmodel = new PopupModel({
                                            el: $('.pop-up'),
                                            model: new QOModel(popuparr)
                                        });
                                        popUpmodel.render();
                                        $(".pop-up .suucess-msg").show();
                                        $(".cart-modalsuccess").show();
                                        setTimeout(function() {
                                            $(".pop-up .suucess-msg").hide();
                                            $(".cart-modalsuccess").hide();
                                        }, 2000);
                                        $("body").find(".overlay-full-width").hide();
                                    }, 4000);

                                } else if (productAdded === count) {
                                    setTimeout(function() {
                                        reviewCart.MiniCart.updateReviewCart();
                                        popUpmodel = new PopupModel({
                                            el: $('.pop-up'),
                                            model: new QOModel(popuparr)
                                        });
                                        popUpmodel.render();
                                        $(".cart-modalsuccess").show().fadeOut(3000);
                                        $("body").find(".overlay-full-width").hide();
                                    }, 4000);
                                }

                            }
                        }, function(errorResp) {
                            errorArray.push(errorResp.message);
                            if (productAdded === products.length - 1) {
                                self.showMessages(errorArray, productAdded);
                            }
                            $("body").find(".overlay-full-width").hide();
                        });
                    }, time);
                    time += 2000;
                });
            } else {
                $("body").find(".overlay-full-width").hide();
            }
        },
        showMessages: function(errorArray, productAdded) {
            //$("body").find(".overlay-left-side").hide();
        },
        addToCart:function(products){
            var a = JSON.stringify(products),
                self = this,popUpmodel,
                popuparr = {
                    poparr: [],
                    successmsg: ''
                },
                QOModel = Backbone.MozuModel.extend({});
                $.ajax({
                    method: "POST",
                    url: "/svc/addall_products_cart", 
                    data:a,
                    dataType: 'json',
                    contentType: 'application/json',
                    success:function(res){
                        reviewCart.MiniCart.updateReviewCart();
                        if(res.status ==="success"){
                            popuparr.successmsg = Hypr.getLabel('successatc');
                            popUpmodel = new PopupModel({
                                el: $('.pop-up'),
                                model: new QOModel(popuparr)
                            });
                            popUpmodel.render();
                            if ($(window).width() < 768) {
                                $(".pop-up").show();
                                $(".pop-up .suucess-msg").show();
                            }
                            $(".pop-up .suucess-msg").show();
                            $(".cart-modalsuccess").show();
                            setTimeout(function() {
                                $(".pop-up .suucess-msg").hide();
                                $(".cart-modalsuccess").hide();
                                $("body").find(".overlay-full-width").hide();
                                self.clearall();       
                            }, 2000);
                        }
                       
                    }
                });  
        },
        restrictProductQty:function(products){
            var cartItems = reviewCart.MiniCart.model.get('items').models,
            cartItemsLength = reviewCart.MiniCart.model.get('items').models.length,
            prods = [], 
            popuparr = {
                poparr: [],
                successmsg: ''
            },
            self = this;
            if (cartItemsLength > 0 ){
               var i=0,len =products.length;  
               for(i;i<len;i++){
                   var flag = true,j=0;
                    for(j;j<cartItemsLength;j++){
                        var msg, popObj;
                        if((products[i].productcode).toUpperCase() === (cartItems[j].get('product.productCode')).toUpperCase() && (cartItems[j].get('quantity')+parseInt(products[i].quantity,10))>4){
                            msg = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html(msg);
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').css({"color": "red"});
                            $(".outofstock[data-mz-productcode='" + products[i].productcode.trim() + "']").html(msg).css({"color": "red"});
                            flag = false;
                            popObj = {
                                prodName:cartItems[j].get('product.name')
                            };
                            popuparr.poparr.push(popObj);
                            j=cartItemsLength-1;
                            break;
                        }else if((products[i].productcode).toUpperCase() === (cartItems[j].get('product.productCode')).toUpperCase() && (cartItems[j].get('quantity')+parseInt(products[i].quantity,10)) > parseInt(products[i].stock,10)){
                            msg = 'Maximum quantity avalible for this product is '+products[i].stock+' you cannot add more than this quantity.';
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html(msg);
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').css({"color": "red"});
                            $(".outofstock[data-mz-productcode='" + products[i].productcode.trim() + "']").html(msg).css({"color": "red"});
                            flag = false;
                            popObj = {
                              prodName:cartItems[j].get('product.name')
                            };
                            popuparr.poparr.push(popObj);
                            j=cartItemsLength-1; 
                            break; 
                        }else if(parseInt(products[i].stock,10) <= 0){
                            msg = 'Inventory is low for this product.';
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html(msg);
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').css({"color": "red"});
                            $(".outofstock[data-mz-productcode='" + products[i].productcode.trim() + "']").html(msg).css({"color": "red"});
                            flag = false;
                            popObj = {
                              prodName:cartItems[j].get('product.name')
                            };
                            popuparr.poparr.push(popObj);
                            j=cartItemsLength-1; 
                            break; 
                        }else {
                            $('.ro-name[itemcode="' + (products[i].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html("");
                            $(".outofstock[data-mz-productcode='" + (products[i].productcode.trim()).toUpperCase() + "']").html("");
                            if((products[i].productcode).toUpperCase() === (cartItems[j].get('product.productCode')).toUpperCase()) break;
                        }
                    }
                    if(flag){
                        delete products[i].stock;
                        prods.push(products[i]);
                    }
                }
                if(prods.length>0){
                    self.addToCart(prods);
                }else{ 
                    $("body").find(".overlay-full-width").hide();
                }
            }else{
                for(var k = 0;k<products.length;k++){
                    var msg1, popObj1, flag1 = true ;
                    if(parseInt(products[k].stock,10) <= 0){
                        msg1 = 'Inventory is low for this product.';
                        $('.ro-name[itemcode="' + (products[k].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html(msg1);
                        $('.ro-name[itemcode="' + (products[k].productcode.trim()).toUpperCase() + '"]').find('.outofstock').css({"color": "red"});
                        $(".outofstock[data-mz-productcode='" + (products[k].productcode.trim()).toUpperCase() + "']").html(msg1).css({"color": "red"});
                        flag1 = false;
                        popObj1 = {
                          prodName:products[k].productcode.trim()
                        };
                        popuparr.poparr.push(popObj1);
                    }else {
                        $('.ro-name[itemcode="' + (products[k].productcode.trim()).toUpperCase() + '"]').find('.outofstock').html("");
                        $(".outofstock[data-mz-productcode='" + (products[k].productcode.trim()).toUpperCase() + "']").html("");
                    }
                    if(flag1){
                        delete products[k].stock;
                        prods.push(products[k]);
                    }
                }
                if(prods.length>0){
                    self.addToCart(prods);
                }else{ 
                    $("body").find(".overlay-full-width").hide();
                }
            }            
        }
    });

    var PopupModel = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/addtocartmodalpop",
        render: function() {
            Backbone.MozuView.prototype.render.call(this);
        }
    });

    $(document).ready(function() {        
        var testmydata = window.testmydata = function (lineItemNum,element){
            if(element == "next"){
                $('.m-rapidinput[dsd-lineitemumber="' + lineItemNum + '"]').hide();
            }
            $(document).find('.m-rapidinput').filter(':visible').first().find('input').focus(); 
        };
        // $(document).find('.m-rapidinput').find('input').on('touchstart', function () {
        //     $(document).find('.m-rapidinput').filter(':visible').first().find('input').focus();  
        // });                        
        var QOModel = Backbone.MozuModel.extend({});
        var orderobj = {
            orderStaus: function() {
                var orderStatus = new rapidorder({
                    el: $('[data-mz-rapid-orderlist]'),
                    model: new QOModel()
                });
            }
        };
        orderobj.orderStaus();
        $('.dsdallproduct').attr('disabled', true);
        $('[data-mz-qty]').attr('disabled', true);
        $(".m-rapidordertable-tbl").hide();
    });
});