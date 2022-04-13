var isApiCalled = false;
require([
    "modules/jquery-mozu", "underscore","modules/api",
    "hyprlive", "modules/backbone-mozu","modules/models-product","dsd-orderprocess/review-cart",
    "dsd-orderprocess/future-popup","modules/models-faceting",'shim!vendor/jquery.quickview[jquery=jQuery]'],
    function ($,_, api, Hypr, Backbone,ProductModels,reviewCart,futurePopup,FacetingModels) {
    
    var PopupModel = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/addtocartmodalpop",
         render: function() {            
            Backbone.MozuView.prototype.render.call(this);
         }        
    });
    var CustomSearchModule = Backbone.MozuView.extend({
        templateName: "modules/product/custom-product-search",
         render: function() {            
            Backbone.MozuView.prototype.render.call(this);
         }        
    });
    
    var assortmentsView = Backbone.MozuView.extend({
        templateName: "modules/dsd-orderprocess/dsdassortment",
        additionalEvents: {
            "click .accordion": "handelAccordian",
            "click .checkboxcustom label": "selectAllFun",
            "change .qnty select": "changeQty"
        }, 
        changeQty: function(e){
          var parent = $(e.currentTarget).parents('.mobile'), 
            qty = parseInt($(e.currentTarget).val(),10), 
            unitPrice = parseFloat(parent.find('.unit-price').text().split('$')[1]);
            parent.find('.price').html("$"+((qty*unitPrice).toFixed(2))); 
            this.updateSummary($(e.currentTarget).parents(".panel.show")); 
        },
        addAllToCart: function(e){
          $("body").find(".overlay-full-width").show();
          var me=this,
            futureDates = this.getSelectedProductDates(e);
            if(futureDates.dates){
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.gettingProductsData(e);
                    }else{
                        futurePopup.AlertView.closepopup();
                        $("body").find(".overlay-full-width").hide();  
                    }
                });
            }else{
                me.gettingProductsData(e);
            }
        },
        getSelectedProductDates:function(e){
            var thisobj = this,productDates = [],fDate,date,count=0,lin,lineItemNum,self=$(e.currentTarget),$acc = $('.accordion');
          $acc.each(function(){
            var $selectedCategory = $(this).next();  
            if($selectedCategory.find('.summary .addToCart').is(':disabled')){
              console.log("Nothing selected!");
                }else{
                    var $lineItemList;
                    if($(window).width() <= 1024){
                        $lineItemList = $selectedCategory.find("tbody tr.mobile").not(".row2"); 
                        $lineItemList.each(function(){
                            var isChecked = $(this).find(".checkboxcustom input").prop("checked");  
                            if(isChecked){
                               count++;
                                if($(this).attr("data-mz-futuredate")){
                                    var product= {
                                      date: $(this).attr("data-mz-futuredate"),
                                      name : $(this).attr('data-mz-productName')
                                    };
                                    productDates.push(product);
                               }
                            }                                
                        });  
                    }else{
                        $lineItemList = $selectedCategory.find('.desktop');
                        $lineItemList.find('.magic-checkbox[type="checkbox"]').filter(function() {
                            if($(this).is(':checked')) {
                                count++;
                                var $selectedItem = $(this).parents('.desktop');
                                if($selectedItem.attr('data-mz-futuredate')){
                                    var productObj = {
                                        date:$selectedItem.attr('data-mz-futuredate'),
                                        name:$selectedItem.attr('data-mz-productName')
                                    };
                                    productDates.push(productObj);    
                                }    
                               
                            }  
                        });
                    }
                }
            });
            
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
        gettingProductsData:function(e){
            var producttocart,lin,quantity,lineItemNum,self=$(e.currentTarget),prdCode,stock,qty,productObj,thisobj = this;
            var $acc = $('.accordion');
            producttocart = [];
            $acc.each(function(){
                var $selectedCategory = $(this).next();  
                if($selectedCategory.find('.summary .addToCart').is(':disabled')){
                    console.log("Nothing selected!");
                }else{
              var $lineItemList;
              if($(window).width() <= 1024){
                $lineItemList = $selectedCategory.find("tbody tr.mobile").not(".row2"); 
                $lineItemList.each(function(){
                  var isChecked = $(this).find(".checkboxcustom input").prop("checked");  
                  if(isChecked){
                    var prodQuantity;
                    if($(this).hasClass("mobile")){
                      prodQuantity = parseInt($(this).next().find("select").val(),10); 
                    }else{ 
                      prodQuantity = parseInt($(this).find("select").val(),10);
                    }
                    var product= {
                      quantity : prodQuantity,
                      productcode: $(this).attr("data-mz-productcode"),
                      stock : $(this).attr('data-mz-productstock')
                    };
                    window.TotalAddedToCart += product.quantity;
                    producttocart.push(product);
                  }                                
                });  
              }else{
                $lineItemList = $selectedCategory.find('.desktop');
                $lineItemList.find('.magic-checkbox[type="checkbox"]').filter(function() {
                  if($(this).is(':checked')) {
                    var $selectedItem = $(this).parents('.desktop');
                    prdCode = $selectedItem.data('mz-productcode');
                    stock = $selectedItem.data('mzProductstock');
                    qty = Number($selectedItem.find('.qnty select').val());
                    productObj = {
                      productcode: prdCode ? prdCode.toString() : prdCode,
                      quantity: qty,
                      stock : stock
                    };
                    if(!( isNaN(prdCode) && isNaN(qty) ))
                      producttocart.push(productObj);
                  }
                });
              }
            }
          });
          if(producttocart.length>0){
            thisobj.restrictProductQty(producttocart,'true');
            console.warn("Adding all items to Cart");
          }else{
            $("body").find(".overlay-full-width").hide();
          }    
        },
        unchekfun : function(clickele){
          if(clickele){
            $(".assortment-container .checkbox .checkboxcustom input").prop("checked",false);
            $(".assortment-container .checkbox .checkboxcustom input").parents("tr.desktop").attr("style","color: inherit; font-weight: inherit;");
            $(".assortment-container .checkbox .checkboxcustom input").parents("tr.mobile.row1").attr("style","color: inherit; font-weight: inherit;");
            $(".assortment-container .checkbox .checkboxcustom input").parents("tr.mobile.row1").next(".row2").attr("style","color: inherit; font-weight: inherit;");
            $('.addAllToCart').prop("disabled",true);
            $('.addToCart').prop('disabled',true);
            try {
              clickele.prop("disabled","disabled");
              clickele.prev("table").children("tbody").children('tr').children("td.total-items").html("0 Items");
              clickele.prev("table").children("tbody").children('tr').children("td.total-weight").html("0.00 Lbs");
              clickele.prev("table").children("tbody").children('tr').children("td.total-price").html("$0.00");
            }catch(err){
              console.warn(err.message+", "+clickele+" is not found");
              $(document).find("table").children("tbody").children('tr').children("td.total-items").html("0 Items");
              $(document).find("table").children("tbody").children('tr').children("td.total-weight").html("0.00 Lbs");
              $(document).find("table").children("tbody").children('tr').children("td.total-price").html("$0.00");
            }
          }
        },
        showPopup :function(popuparr,clickele){
          var QOModel = Backbone.MozuModel.extend({}),time=2000,self = this,
          popUpmodel = new PopupModel({
            el: $('.pop-up'),
            model: new QOModel(popuparr)
          });
          popUpmodel.render();
          if(popuparr.poparr.length>3){
            time+= (popuparr.poparr.length*500);
          }
          if ($(window).width() <= 768) {
            $(".pop-up").show();
            $(".pop-up .suucess-msg").show();
          }
          $(".pop-up .suucess-msg").show();
          $(".cart-modalsuccess").show();
          setTimeout(function() {
            $(".pop-up .suucess-msg").hide();
            $(".cart-modalsuccess").hide();
            self.unchekfun(clickele);
            $("body").find(".overlay-full-width").hide();
          },time);
        },
        addToProductsCart : function(products,clickele,prodArray){
          var a = JSON.stringify(products),self = this,popuparr = {poparr: [],successmsg: ''},prodLength = products.length;
          $.ajax({
            method: "POST",
            url: "/svc/addall_products_cart",
            data:a,
            dataType: 'json',
            contentType: 'application/json',
            success:function(res){
              reviewCart.MiniCart.updateReviewCart();
              popuparr.poparr = popuparr.poparr.concat(prodArray);
              if(res.status ==="success"){
                popuparr.successmsg = Hypr.getLabel('successatc');
                self.showPopup(popuparr,clickele);
              }else if(res.status ==="error" && prodLength != res.counter){
                $.each(res.oos,function(i,v){
                  var popObj = {
                    prodName : $('[assort-itemcode="'+v+'"]').filter(':visible').find('div').text().trim()
                  };
                  $('[assort-itemcode="'+v+'"]').filter(':visible').find('.assort-error').html(Hypr.getLabel('outostock')+'. <span class="notify">Notify Me</span>');
                  var checkbox = $('tr.desktop[data-mz-productcode="'+v+'"]');
                  checkbox.find('.checkboxcustom').find('input').attr('checked',false).attr('disabled',true);
                  checkbox.find('.checkboxcustom label').trigger('click');
                  popuparr.poparr.push(popObj);
                });
                if(res.counter>0)popuparr.successmsg = Hypr.getLabel('successatc');
                self.showPopup(popuparr,clickele);
              }
            }
          });  
        }, 
        restrictProductQty: function(products,clickele){
          var cartItems = reviewCart.MiniCart.model.get('items').models, cartItemsLength = cartItems.length, prods = [], popuparr = {poparr: [],successmsg: ''}, self = this;
          if(cartItemsLength > 0 ){
            var i=0,len =products.length;  
            for(i;i<len;i++){
              var flag = true,j=0;
              for(j;j<cartItemsLength;j++){
                var popObj = {}, msg = "";
                if(products[i].productcode === cartItems[j].get('product.productCode') && (cartItems[j].get('quantity')+parseInt(products[i].quantity,10))>4){
                  msg = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                  $('.accordion.active').next().find('[assort-itemcode = "'+products[i].productcode.trim()+'"]').find('.assort-error').html(msg);
                  flag = false;
                  popObj = {
                    prodName:cartItems[j].get('product.name')
                  };
                  popuparr.poparr.push(popObj);
                  j=cartItemsLength-1;
                }else if(products[i].productcode === cartItems[j].get('product.productCode') && (cartItems[j].get('quantity')+parseInt(products[i].quantity,10))>parseInt(products[i].stock,10)){
                    msg = 'Maximum quantity avalible for this product is '+products[i].stock+' you cannot add more than this quantity.';
                    $('.accordion.active').next().find('[assort-itemcode = "'+products[i].productcode.trim()+'"]').find('.assort-error').html(msg);
                    flag = false;
                    popObj = {
                      prodName:cartItems[j].get('product.name')
                    };
                    popuparr.poparr.push(popObj);
                    j=cartItemsLength-1;  
                }else{
                  if($('.accordion.active').next().find('[assort-itemcode = "'+products[i].productcode.trim()+'"]').find('.assort-error').text().indexOf('Maximum quantity of any item is 4 per order')>-1){
                    $('.accordion.active').next().find('[assort-itemcode = "'+products[i].productcode.trim()+'"]').find('.assort-error').html('');
                  }
                }
              }
              if(flag){
                delete products[i].stock;
                prods.push(products[i]);
              }
            }
            if(prods.length>0){
              self.addToProductsCart(prods,clickele,popuparr.poparr);
            }else{ 
              self.showPopup(popuparr,clickele);
            }
          }else{
            if(products.length>0){
              self.addToProductsCart(products,clickele,popuparr.poparr);
            }else{
              $("body").find(".overlay-full-width").hide();
            }
          }  
        },
        addToCart: function(e){
          $(".alerts").fadeOut();
            var me=this,
            futureDates = this.getAssortProductDates(e);
            if(futureDates.dates){
                futurePopup.AlertView.fillmessage(futureDates.btn,futureDates.message,
                function(userChoice) {
                    if (userChoice) {
                        futurePopup.AlertView.closepopup();
                        me.getAssortProducts(e);
                    }else{
                        futurePopup.AlertView.closepopup();
                        $("body").find(".overlay-full-width").hide();  
                    }
                });
            }else{
                me.getAssortProducts(e);
            }
        },
        getAssortProductDates:function(e){
            var currentObj = this, self = $(e.currentTarget).parents(".panel.show"),productDates = [], items =self.find("tbody tr.desktop").not(".row2"),fDate,date,count=0;
            $("body").find(".overlay-full-width").show();
            if($(window).width() <= 1024){
                items = self.find("tbody tr.mobile").not(".row2"); 
            }
            items.each(function(){
                var isChecked = $(this).find(".checkboxcustom input").prop("checked");  
                if(isChecked){
                    count++;
                    if($(this).attr('data-mz-futuredate').length>5){
                        var product= {
                            name: $(this).attr("data-mz-productname"),
                            date : $(this).attr('data-mz-futuredate')
                        };
                        productDates.push(product);
                    }
                }                                
            });       
             
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
        getAssortProducts:function(e){
            var currentObj = this, self = $(e.currentTarget).parents(".panel.show"),products = [], items =self.find("tbody tr.desktop").not(".row2"),productDates = [];
          $("body").find(".overlay-full-width").show();
          if($(window).width() <= 1024){
            items = self.find("tbody tr.mobile").not(".row2"); 
          }
          items.each(function(){
            var isChecked = $(this).find(".checkboxcustom input").prop("checked");  
            if(isChecked){
              var prodQuantity;
              if($(this).hasClass("mobile")){
                prodQuantity = parseInt($(this).next().find("select").val(),10); 
              }else{ 
                prodQuantity = parseInt($(this).find("select").val(),10);
              }
              var product= {
                quantity : prodQuantity,
                productcode: $(this).attr("data-mz-productcode"),
                stock : $(this).attr('data-mz-productstock'),
                isHeatSensitive:$(this).attr('data-mz-heatSensitive')
              };
              window.TotalAddedToCart += product.quantity;
              products.push(product);
            }                                
          });        
          if(products.length>0){
            // makeQuickOrder(products,clickele);
            currentObj.restrictProductQty(products,$(e.currentTarget));
            $(".alerts.message").show().fadeOut(12000).empty();
            $('html,body').animate({scrollTop:self.prev().offset().top-50},1000);
          }
        },
        calcTotal: function(productCode,productQuantity,productPrice,productWeight){
          var total = {
            price : productQuantity*productPrice,
            weight : productQuantity* productWeight
          };
          return total; 
        },
        updateSummary: function(element){
          var self = this;
          var totalPrice=0,totalWeight=0,totalItems=0;
          var container = element;
          var items =container.find("tbody tr.desktop").not(".row2"); 
          if($(window).width() <= 1024){
            items =container.find("tbody tr.mobile").not(".row2"); 
          }
          items.each(function(){  
            var isChecked = $(this).find(".checkboxcustom input:not(:disabled)").prop("checked");
            if(isChecked){
              $(this).css({"color":"initial","font-weight": "bold"});
              var productQuantity =1;
              if($(this).hasClass("mobile")){
                $(this).next().css({"color":"initial","font-weight": "bold"});  
                productQuantity = parseInt($(this).next().find("select").val(),10);
              }else{
                productQuantity = parseInt($(this).find("select").val(),10);      
              }
              var productPrice = $(this).attr("data-mz-productprice");
              var productWeight = $(this).attr("data-mz-productweight"); 
              var productCode = $(this).attr("data-mz-productcode");
              var productStock = parseInt($(this).attr("data-mz-productstock"),10);
              if(productStock === 0 || productStock < productQuantity){ 
                $(this).find(".desc .stock-info").remove();
                productQuantity = productStock; 
                $(this).find("select").val(productQuantity);
              }
              var ProductTotal = self.calcTotal(productCode,productQuantity,productPrice,productWeight);
              $(this).find("td.price").html("$"+ProductTotal.price.toFixed(2) );
              totalPrice += ProductTotal.price;
              totalWeight += ProductTotal.weight; 
              totalItems += parseInt(productQuantity,10); 
            }else{ 
              $(this).css({"color":"inherit","font-weight": "inherit"});
              if($(this).hasClass("mobile")){
                $(this).next().css({"color":"inherit","font-weight": "inherit"});  
              }  
            }
          });
          var summaryTable = container.find(".summary table");
          summaryTable.find(".total-items").html(totalItems+" Items");
          summaryTable.find(".total-price").html("$"+totalPrice.toFixed(2));
          summaryTable.find(".total-weight").html(totalWeight.toFixed(2)+" Lbs"); 
          if( !totalItems ){ 
            container.find(".summary button").attr("disabled",true);
          }else{
            container.find(".summary button").attr("disabled",false);    
          }       
        },
        selectAllFun: function(e){
          var self = $(e.currentTarget);
          var el = self.prev();
          if(el.prop("checked") && !el.prop("disabled")){ 
            el.prop("checked",false);
            if(self.hasClass("select-all")){
              self.parents(".cart-table").find(".checkboxcustom input:not(:disabled)").prop("checked",false); 
            }else{
              self.parents(".cart-table").find("th.checkbox input[type='checkbox']:not(:disabled)").prop("checked",false); 
            }
          }else if(!el.prop("disabled")){
            el.prop("checked",true);
            if(self.hasClass("select-all")) 
              self.parents(".cart-table").find(".checkboxcustom input:not(:disabled)").prop("checked",true);
          }   
          var element = self.parents(".panel.show");
          if($(window).width() <= 1024){
            if( element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.mobile input[type='checkbox']:checked").length && element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length !== 0){
              element.find("thead input[type='checkbox']").prop("checked",true);
            }else{
              element.find("thead input[type='checkbox']").prop("checked",false);
            } 
          }else{
            if( element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.desktop input[type='checkbox']:checked").length && element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length !== 0){
              element.find("thead input[type='checkbox']").prop("checked",true);
            }else{
              element.find("thead input[type='checkbox']").prop("checked",false);
            } 
          }
          this.updateSummary(element); 
          if($('.summary').find('button.addToCart').filter(':not(:disabled)').length > 0) {
            $('.addAllToCart').prop("disabled",false);
          }else {
            $('.addAllToCart').prop("disabled",true);
          }
        },
        handelAccordian: function(e){
          //Handle category accordion Toggle.
          e.preventDefault();
          console.log("$(e.currentTarget) ------",$(e.currentTarget));
          var catCode =  $(e.currentTarget).attr('data-mz-categoryid');
          console.log("catCode----",catCode);
          var modelsItems = [];
          if(!$(e.currentTarget).hasClass("active")){
            try
            {
              if(!isApiCalled){
                $(".accordion-container").addClass("openoverlay");
                isApiCalled = true;
                api.request('POST','svc/dsdassortments?categoryId='+catCode,{"customerId":require.mozuData('user').lastName,"site":"dsd"}).then(function(result){
                   modelsItems = window.assortments.model.get('items') ? window.assortments.model.get('items') : [];
                  var itemFound = false;
                  console.log("modelsItems ---",modelsItems);
                  for(var i =0;i<modelsItems.length;i++){
                    var item = modelsItems[i];
                    if(item.category[0].categoryCode.toString() === catCode.toString()){
                      modelsItems[i] = result.items[0];
                      itemFound = true;
                      break;
                    }
                  }
                  if(!itemFound){
                    modelsItems.push(result.items[0]);
                  }
                  window.assortments.model.set('items',modelsItems);
                  window.assortments.render();
                  setTimeout(function(){
                    $(".accordion").removeClass("active");
                    $(".panel.show").removeClass("show");
                    $(".accordion[data-mz-categoryid='"+catCode+"']").addClass("active");
                    $(".panel[data-mz-categoryid-panel='"+catCode+"']").addClass("show");
                    $(".click-plus-msg").hide();
                    $(".click-minus-msg").show();
                    $('html, body').animate({
                       // scrollTop: $(curEle).offset().top-50
                    }, 800);
                    $(".accordion-container").removeClass("openoverlay");
                  },200);
                  
                      isApiCalled=false;
                  });
              }  
              }catch(err){
                console.log(" api error ---",err);
                $(".accordion-container").removeClass("openoverlay");
              }
             
          }else{
              $(e.currentTarget).removeClass("active").next().removeClass("show");
              $(".click-minus-msg").hide();
              $(".click-plus-msg").show();
          } 
          return false;
        },
        render: function(){
          $(".loggedin-msg .mz-utilitynav-link").text($.cookie("userEmail"));
            Backbone.MozuView.prototype.render.call(this);  
        }
    });

    $(document).ready(function(event){
      
      if($.cookie("userData") === undefined){
        window.location = Hypr.getThemeSetting('themeLoginURL')+"?clearSession=yes";
      }

        var QOModel= Backbone.MozuModel.extend({});
        var result = {ActCategory:require.mozuData('navigation')};
        var assortments = window.assortments = new assortmentsView({ 
          el: $('#assortments'),
          model: new QOModel(result)  
      });
      window.assortments = assortments;
      assortments.render();
      /*
        api.request('GET','svc/dsdassortments').then(function(result){
            result.ActCategory = require.mozuData('navigation');
            var assortments = window.assortments = new assortmentsView({ 
                el: $('#assortments'),
                model: new QOModel(result)  
            });
            window.assortments = assortments;
            assortments.render();
        });*/
        var searchItemsFn = _.debounce(function(term) {
          api.request('POST','svc/customsearch',{"query":term,"customerId":require.mozuData('user').lastName,site:"dsd"}).then(function(response){
              console.log(response);
              var facetModel,emptyresults = [];
              if(response === "no response") {
                  facetModel = new FacetingModels.FacetedProductCollection(emptyresults);
              } else {
                var productslist = response.items;
                if(productslist) {
                  facetModel = new FacetingModels.FacetedProductCollection(response);
                }
              }
              if(facetModel) {
                $("#customsuggestion").show();
                var customSearchModule = new CustomSearchModule({
                    el:$('#customsuggestion'),
                    model:facetModel
                });
                window.customSearchModule = customSearchModule;
                customSearchModule.render();
              }
            });
        }, 200);

        /* Search for items based on prd-name/code and update */
        $("#search-assortment").on("keyup", function(e) {
            // if(e.keyCode == 32) {
            var term = $(this).val();
            if (term.length > 2) {
                searchItemsFn(term);
            } else {
                $("#customsuggestion").html("");
            }
        });
        // on quantity update update the price 
        $(document).find('#search-result-table-container').on('change','.mobile.row2 .qnty select',function(e){
          var parent = $(e.currentTarget).parents('.mobile'), qty = parseInt($(e.currentTarget).val(),10), unitPrice = parseFloat($(parent.find('.price')[0]).text().split('$')[1]);
          $(parent.find('.price')[1]).html("$"+((qty*unitPrice).toFixed(2))); 
        });

        var outOfStock = function(product,current){
          var cartItems = reviewCart.MiniCart.model.get('items').models, cartItemsLength = cartItems.length;
          var inventoryInfo = current.get('inventoryInfo').onlineStockAvailable;
          var manageStock = current.get('inventoryInfo').manageStock, j = 0;
          var addProduct = {
              available:true,
              msg: ""
          };
          if((inventoryInfo > 0 && manageStock )|| !manageStock){
            if(cartItemsLength > 0 && parseInt(product.quantity,10) <= 4){
              for (j; j < cartItemsLength; j++) {
                if (product.productCode.trim() === cartItems[j].get('product').get('productCode')) {
                  if(inventoryInfo < cartItems[j].get('quantity') + parseInt(product.quantity,10)){
                    addProduct.available = false;
                    if(product.searchResult){
                      $('#search-result-table-container td.desc .stock-info').html("This item is out of Stock."); 
                    }else{
                      $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html("This item is out of Stock.");
                    }
                    return addProduct;
                  }else if(cartItems[j].get('quantity') + parseInt(product.quantity,10) > 4){
                    addProduct.available = false;
                    var htmlStr = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
                    if(product.searchResult){
                      $('#search-result-table-container td.desc .stock-info').html(htmlStr);
                    }else{
                      $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html(htmlStr);
                    }
                    return addProduct; 
                  }
                }
              }
              if(inventoryInfo<4){ 
                if(product.searchResult){
                  $('#search-result-table-container td.desc .stock-info').html("Only "+inventoryInfo+" in stock");
                }else{
                  $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html("Only "+inventoryInfo+" in stock");
                }
              }else{
                if(product.searchResult){
                  $('#search-result-table-container td.desc .stock-info').empty();
                }else{
                  $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').empty();
                }
              }
              return addProduct;
            }else if(parseInt(product.quantity,10)>4){
              var htmlStrg = 'Maximum quantity of any item is 4 per order. If you need more, <a href="/contact-us" title="contact us">Contact Us.</a>';
              if(product.searchResult){
                $('#search-result-table-container td.desc .stock-info').html(htmlStrg);
              }else{
                $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html(htmlStrg);
              }
              return addProduct;
            }else{
              if(inventoryInfo<4){
                if(product.searchResult){
                  $('#search-result-table-container td.desc .stock-info').html("Only "+inventoryInfo+" in stock");
                }else{
                  $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html("Only "+inventoryInfo+" in stock");
                }
              }else{
                if(product.searchResult){
                  $('#search-result-table-container td.desc .stock-info').empty();
                }else{
                  $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').empty();
                }
              }
              return addProduct;
            }
          }else{
            addProduct.available = false;
            if(product.searchResult){
              $('#search-result-table-container td.desc .stock-info').html("This item is out of Stock.");
            }
            else{
              $('.accordion.active').next().find('[assort-itemcode = "'+product.productCode.trim()+'"]').find('.assort-error').html("This item is out of Stock.");
            }
            return addProduct;
          }
        };
        var makeQuickOrder =function(products,clickele){
          var errorArray = [], self = this, productAdded = 0,time = 2000,count = products.length;
          var popuparr = {
              poparr:[],
              successmsg:''
            },QOModel = Backbone.MozuModel.extend({});
            if(products.length>0){    
                $(products).each(function(key,pid){
                    api.get('product', pid.productCode).then(function(sdkProduct) {
                      var PRODUCT = new ProductModels.Product(sdkProduct.data),
                      res =  outOfStock(pid,PRODUCT);
                        if(res.available) {
                            PRODUCT.set({'quantity':pid.quantity});
                            PRODUCT.addToCart();
                                PRODUCT.on('addedtocart', function(attr) { 
                                productAdded++;
                                reviewCart.MiniCart.updateReviewCart(); 
                                PRODUCT = ''; 
                                $("#search-result-table-container").fadeOut();
                                if(productAdded  === count ){
                                    popuparr.successmsg =Hypr.getLabel('successatc');
                                      reviewCart.MiniCart.updateReviewCart();
                                      var popUpmodel = new PopupModel({
                                        el: $('.pop-up'),
                                        model: new QOModel(popuparr)
                                      });                                        
                                      popUpmodel.render();
                                      if($(window).width() <= 768){
                                        $(".pop-up").show();
                                        $(".pop-up .suucess-msg").show();
                                      }
                                      $(".cart-modalsuccess").show();
                                      setTimeout(function(){
                                        $(".pop-up .suucess-msg").hide();
                                        $(".cart-modalsuccess").hide();
                                      },2000);                                            
                                      $("body").find(".overlay-full-width").hide(); 
                                  }
                                });
                                api.on('error', function (badPromise, xhr, requestConf) { 
                                  productAdded++;
                                  errorArray.push(badPromise.message);
                                  if(productAdded  === products.length ){
                                    window.assortments.showMessages(errorArray, productAdded,clickele);
                                  }
                                  $("body").find(".overlay-full-width").hide();
                                });
                              }else if(!res.available){
                                count--;
                                var popObj = {
                                  prodName : PRODUCT.get('content').get('productName')
                                };
                                popuparr.poparr.push(popObj);
                                var popUpmodel;
                                if (productAdded === count && productAdded !== 0 ) {
                                  var len = count;
                                  $(".btn-proceedtocheck").prop('disabled', false);
                                    reviewCart.MiniCart.updateReviewCart(); 
                                    popuparr.successmsg =Hypr.getLabel('successatc');
                                    popUpmodel = new PopupModel({
                                      el: $('.pop-up'),
                                      model: new QOModel(popuparr)
                                    });
                                    popUpmodel.render();
                                    $(".pop-up .suucess-msg").show();
                                    $(".cart-modalsuccess").show();
                                    setTimeout(function(){
                                      $(".pop-up .suucess-msg").hide();
                                      $(".cart-modalsuccess").hide();
                                    },2000);
                                    $("body").find(".overlay-full-width").hide();
                                  }else if (productAdded === count ){
                                reviewCart.MiniCart.updateReviewCart(); 
                                    popUpmodel = new PopupModel({
                                      el: $('.pop-up'),
                                      model: new QOModel(popuparr)
                                    });
                                    popUpmodel.render();
                                    $(".cart-modalsuccess").show();
                                    setTimeout(function(){
                                      $(".cart-modalsuccess").hide();
                                    },2000);
                                    $("body").find(".overlay-full-width").hide();
                                  }
                                }
                              },function(errorResp){
                                errorArray.push(errorResp.message);
                                if(productAdded  === products.length - 1){
                                  window.assortments.showMessages(errorArray, productAdded,clickele);  
                                }
                                $("body").find(".overlay-full-width").hide();
                    }); 
                });
            }else{
                $("body").find(".overlay-full-width").hide();
            }
        };
        var showPopup  = function(popuparr,clickele){
          var QOModel = Backbone.MozuModel.extend({}),time=2000,self = this,
          popUpmodel = new PopupModel({
            el: $('.pop-up'),
            model: new QOModel(popuparr)
          });
          popUpmodel.render();
          if(popuparr.poparr.length>3){
            time+= (popuparr.poparr.length*500);
          }
          if ($(window).width() <= 768) {
            $(".pop-up").show();
            $(".pop-up .suucess-msg").show();
          }
          $(".pop-up .suucess-msg").show();
          $(".cart-modalsuccess").show();
          setTimeout(function() {
            $(".pop-up .suucess-msg").hide();
            $(".cart-modalsuccess").hide();
            $("body").find(".overlay-full-width").hide();
          },time);
        };
        var TotalAddedToCart = window.TotalAddedToCart =0; 
        $(".checkboxcustom label").click(function(){
            var self = $(this);
            var el = self.prev();
            if(el.prop("checked") && !el.prop("disabled")){ 
                el.prop("checked",false);
                 if(self.hasClass("select-all")){
                    self.parents(".cart-table").find(".checkboxcustom input:not(:disabled)").prop("checked",false); 
                }else{
                    self.parents(".cart-table").find("th.checkbox input[type='checkbox']:not(:disabled)").prop("checked",false); 
                }
            }else if(!el.prop("disabled")){
                el.prop("checked",true);
                if(self.hasClass("select-all")) 
                  self.parents(".cart-table").find(".checkboxcustom input:not(:disabled)").prop("checked",true);
            }   
            var element = self.parents(".panel.show");
            if($(window).width() <= 1024){
                if( element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.mobile input[type='checkbox']:checked").length && element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length !== 0){
                element.find("thead input[type='checkbox']").prop("checked",true);
               /* }else if(element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.mobile input[type='checkbox']:checked").length && element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length !== 0){
                    element.find("thead input[type='checkbox']").prop("checked",true);*/
                }else{
                  element.find("thead input[type='checkbox']").prop("checked",false);
                } 
            }else{
              if( element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.desktop input[type='checkbox']:checked").length && element.find("tbody tr.desktop input[type='checkbox']:not(:disabled)").length !== 0){
                element.find("thead input[type='checkbox']").prop("checked",true);
           /* }else if(element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length === element.find("tbody tr.mobile input[type='checkbox']:checked").length && element.find("tbody tr.mobile input[type='checkbox']:not(:disabled)").length !== 0){
                element.find("thead input[type='checkbox']").prop("checked",true);*/
              }else{
                element.find("thead input[type='checkbox']").prop("checked",false);
              } 
            }
            
            window.assortments.updateSummary(element); 
            // Enable/disable AddAllToCart btn
            if($('.summary').find('button.addToCart').filter(':not(:disabled)').length > 0) {
                $('.addAllToCart').prop("disabled",false);
            }
            else {
                $('.addAllToCart').prop("disabled",true);
            } 
        });
        $("select").not("#search-result-table-container select").change(function(){
            var self = $(this);
            var attrHolder = self.parents("tr");
            var productQuantity = self.val();
            var productPrice = attrHolder.attr("data-mz-productprice");
            var productWeight = attrHolder.attr("data-mz-productweight"); 
            var productCode = attrHolder.attr("data-mz-productcode");  
            self.parent().next(".price").html("$"+ (productPrice*productQuantity).toFixed(2) );
            window.assortments.updateSummary(self.parents(".panel.show"));
        }); 
        //Search table
        var product = {};
        $(document).on("click",".tt-suggestion",function(e){
            e.preventDefault();

           //Reset all properties to default
           $("#search-result-table-container").find("select").prop("disabled",false);
           $("#search-result-table-container tbody tr").css("color","initial");
           $("#search-result-table-container .stock-info").empty(); 
           var optionsHtml = [];
            for(var i=1; i<= 4; i++){ 
                var sel = ( i == 1 ) ? 'selected' : '';
             optionsHtml.push("<option value='" +i+ "' "+ sel +">" +i+ "</option>");   
            }   
                $("#search-result-table-container").find("select").html(optionsHtml.join("") ); 
                
           $("#search-result-table-container").find("select").val(1);
           var self = $(this).find("a.mz-itemlisting-title");
            product.Name = self.html();
            $("#search-assortment").val(product.Name); 
            product.Code = self.attr("data-mz-productcode");
            product.Price = parseFloat(self.attr("data-mz-price"),10);
            product.Weight = parseFloat(self.attr("data-mz-weight"),10);  
            product.HeatSensitive = self.attr("data-mz-iscoldpack");
            product.Stock = parseFloat(self.attr("data-mz-stock"),10); 
            product.future = $(document).find('.desc[assort-itemcode="'+product.Code+'"]').find('.assort-future');    
            $(".mz-searchbox-input.tt-input").val(product.Name);
            $("#search-result-table-container .item").not("th.item").html(product.Code); 
            $("#search-result-table-container td.desc .description").html(window.unescapeHTML(product.Name));
            $("#search-result-table-container td.desc .assort-future").remove();
            if( product.Stock>0 && product.future.length>0){
                var fdate = product.future.first().clone();
                $("#search-result-table-container td.desc .stock-info").after(fdate);
                $("#search-result-table-container td.desc .description").css("font-weight","bold");
                $("#search-result-table-container td.desc .assort-future").attr('prod-code',product.Code);
            }
            if( product.Stock < 4 ){
              if( product.Stock === 0 ){ 
                $("#search-result-table-container tbody tr").css("color","red");
                $("#search-result-table-container td.desc .stock-info").append("This item is out of Stock."); 
                $("#search-result-table-container").find("select").prop("disabled",true); 
                $("#search-result-table-container").find('.notify-button').addClass('active');
                $("#search-result-table-container").find('.atc-cust').removeClass('active');
              }else{ 
                $("#search-result-table-container td.desc .stock-info").html("Only "+ product.Stock +" in stock.");
                var optionsHtml2 = []; 
                for(var j=1;j<= product.Stock ;j++){ 
                  var sel2 = ( j == 1 ) ? 'selected' : '';
                  optionsHtml2.push("<option value='" +j+ "' "+ sel2 +">" +j+ "</option>");   
                }  
                $("#search-result-table-container").find("select").html(optionsHtml2.join("") ); 
                $("#search-result-table-container").find('.notify-button').removeClass('active');
                $("#search-result-table-container").find('.atc-cust').addClass('active'); 
              }
            }else{
              $("#search-result-table-container").find('.notify-button').removeClass('active');
              $("#search-result-table-container").find('.atc-cust').addClass('active'); 
            }
            $("#search-result-table-container tr").attr("");
            $("#search-result-table-container td.price").html("$"+ product.Price.toFixed(2) ); 
            $("#search-result-table-container td.weight").html( product.Weight.toFixed(2) );  
            if(product.HeatSensitive == "yes"){
                if($(window).width() <= 1024){ 
                $("#search-result-table-container td.is-coldpack").html("<div>Cold Pack</div>");
                }else{
                $("#search-result-table-container td.is-coldpack").html("<img src='../resources/images/coldpack-tick.png' alt='Yes' />");
                }
            }else{
                $("#search-result-table-container td.is-coldpack").empty();
            }
            $("#search-result-table-container").show();  
                               
        });
        $('body').click(function(e) {
            if (!$(e.target).hasClass("mz-searchbox-input") && $("#customsuggestion").is(":visible")){
                $("#customsuggestion").hide();
                $("#customsuggestion").html("");
            }
        });
        $(document).on("change","#search-result-table-container select",function(){ 
            if($(this).val() > product.Stock){
               $(this).val(product.Stock); 
            }
        });
        $(document).on("click",".atc-btn,.notify-button",function(){
            $(".alerts").hide();
            var searchItemQty =  $("#search-result-table-container .desktop").find("td.qnty select").val();
            if($(window).width()<1025)
              searchItemQty = $("#search-result-table-container .mobile").find("td.qnty select").val(); 
              var productDetails= [{
                quantity : parseInt(searchItemQty,10),
                productCode: product.Code,
                searchResult:true,
                futureDate:product.future.first().text().trim()
            }];
            if(!($("#search-result-table-container .desktop").find("td.qnty select").is(':disabled') || $("#search-result-table-container .mobile").find("td.qnty select").is(':disabled'))){
              if(productDetails){
                if(productDetails[0].futureDate.length>5){
                  var fDate = new Date(productDetails[0].futureDate.split(' ')[2].concat(productDetails[0].futureDate.split(' ')[3])),
                    date =  ('0'+(fDate.getMonth()+1)).slice(-2)+ '/' + ('0'+fDate.getDate()).slice(-2) + '/' + fDate.getFullYear(),
                    futureDates = {
                        dates:true,
                        message:"This item will be available on "+date+". You can add this item, but your order will not ship before "+date+". There are no partial shipment."
                    }; 
                    if(futureDates.dates){
                        futurePopup.AlertView.fillmessage("future-date",futureDates.message,
                        function(userChoice) {
                            if (userChoice) {
                                futurePopup.AlertView.closepopup();
                                makeQuickOrder(productDetails,'true');
                            }else{
                                futurePopup.AlertView.closepopup();
                                $("body").find(".overlay-full-width").hide();  
                            }
                        });
                    }else{
                        makeQuickOrder(productDetails,'true');
                    }
                }else{
                    makeQuickOrder(productDetails,'true');
                } 
                $(".alerts.search-table-message").show().fadeOut(12000).empty();
              } 
            }else{

              var customer;

              if($.cookie('userData') && JSON.parse($.cookie('userData')).email){
                customer = JSON.parse($.cookie('userData')).email;
              }

              

              $('#notify-me-content').html("<div id='notify-me-dialog'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input id='notify-me-email' type='email' value='"+customer+"'>"+
                             "<span id='notify-me-button' data-mz-product-code='" + product.code + "'>NOTIFY ME</span></form>"+
                            "<div class='notify-error'>Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.</div></div>");
              $('#myModal').show();
              $('html, body').css('overflow','hidden');




             //   var customer = '';
             //    if($.cookie('userData') && JSON.parse($.cookie('userData')).email){
             //      customer = JSON.parse(jQuery.cookie('userData')).email;
             //    }
             //  $.colorbox({
             //      open : true,
             //      maxWidth : "100%", 
             //      maxHeight : "100%",
             //      scrolling : false, 
             //      fadeOut : 500,
             //      top:"30%",
             //      html : "<div id='notify-me-dialog'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input id='notify-me-email' type='email' value='"+customer+"'>"+
             //              "<span id='notify-me-button' data-mz-product-code='" + product.Code + "'>NOTIFY ME</span></form>"+
             //             "<div class='notify-error'>Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.</div></div>", 
             // //"/resources/intl/geolocate.html",
             //      overlayClose : true, 
             //      onComplete : function () {
             //          $('#cboxClose').show();
             //          $('#cboxLoadedContent').css({
             //          background : "#ffffff"
             //      });
             //          $('body').css('overflow','hidden');
             //      },
             //      onClosed:function(){
             //          $('body').css('overflow','auto');
             //      }
             //  });
            } 
        }); 
        $(document).on("click",".remove-item",function(){
            $(".mz-searchbox-input.tt-input").val("");// emtpy the search input on remove item
           $("#search-result-table-container").hide(); 
        });
         

        // New pop-up for NOTIFY ME button
        $(document).on('click', '.notify', function(e){
          var pcode;
            if($(e.currentTarget).parents('[assort-itemcode]').attr('assort-itemcode')){
                pcode = $(e.currentTarget).parents('[assort-itemcode]').attr('assort-itemcode');
            }else if($(e.currentTarget).parents('tr').find('.roinput').val()){
                pcode = $(e.currentTarget).parents('tr').find('.roinput').val();
            }else if($(e.currentTarget).parent().attr('prodcode')){
                pcode = $(e.currentTarget).parent().attr('prodcode');
            }else if($(e.currentTarget).parent().attr('prod-code')){
                pcode = $(e.currentTarget).parent().attr('prod-code');
            }
          var customer;

          if($.cookie('userData') && JSON.parse($.cookie('userData')).email){
            customer = JSON.parse($.cookie('userData')).email;
          }

          $('#notify-me-content').html("<div id='notify-me-dialog'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input id='notify-me-email' type='email' value='"+customer+"'>"+
                         "<span id='notify-me-button' data-mz-product-code='" + pcode + "'>NOTIFY ME</span></form>"+
                        "<div class='notify-error'>Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.</div></div>");
          $('#myModal').show();
          $('html, body').css('overflow','hidden');
        });

        $(window).on('click', function(event){
          if (event.target == $('#myModal')[0]) {
            $('#myModal').hide();
            $('body').css('overflow','auto');
            $('html').css('overflow','');
          }
        });

        $(document).on('click', '#notifyme-close', function(){
          $('#myModal').hide();
          $('body').css('overflow','auto');
          $('html').css('overflow','');
        });



        // Notify me
        // $(document).on('click','.notify', function(e) {
        //     var pcode;
        //     if($(e.currentTarget).parents('[assort-itemcode]').attr('assort-itemcode')){
        //         pcode = $(e.currentTarget).parents('[assort-itemcode]').attr('assort-itemcode');
        //     }else if($(e.currentTarget).parents('tr').find('.roinput').val()){
        //         pcode = $(e.currentTarget).parents('tr').find('.roinput').val();
        //     }else if($(e.currentTarget).parent().attr('prodcode')){
        //         pcode = $(e.currentTarget).parent().attr('prodcode');
        //     }else if($(e.currentTarget).parent().attr('prod-code')){
        //         pcode = $(e.currentTarget).parent().attr('prod-code');
        //     }
        //      var customer = '';
        //       if($.cookie('userData') && JSON.parse($.cookie('userData')).email){
        //         customer = JSON.parse(jQuery.cookie('userData')).email;
        //       }

        //     $.colorbox({
        //         open : true,
        //         maxWidth : "100%", 
        //         maxHeight : "100%",
        //         scrolling : false, 
        //         fadeOut : 500,
        //         top:"30%",
        //         html : "<div id='notify-me-dialog'><form><span>Enter your email address to be notified when this item is back in stock.</span><br><input id='notify-me-email' type='email' value='"+customer+"'>"+
        //                 "<span id='notify-me-button' data-mz-product-code='" + pcode + "'>NOTIFY ME</span></form>"+
        //                "<div class='notify-error'>Please be sure to provide your Email Address. Make sure you have included the '@' and the '.' in the address.</div></div>", 
        //    // "/resources/intl/geolocate.html",
        //         overlayClose : true, 
        //         onComplete : function () {
        //             $('#cboxClose').show();
        //             $('#cboxLoadedContent').css({
        //             background : "#ffffff"
        //         });
        //             $('body').css('overflow','hidden');
                
        //         },
        //         onClosed:function(){
        //             $('body').css('overflow','auto');
        //         }
        //     });

        // });        
        
        $(document).on('click','#cboxClose', function(e) {
          $('body').css('overflow','auto');
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
                        }, function () {
                        $("#notify-me-dialog").fadeOut(500, function () { $("#notify-me-dialog").empty().html("Thank you! We'll let you know when we have more.").fadeIn(500); });
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
        //add product descriptions from JSON object located in default template widget
        var widgetInput = JSON.parse(document.getElementById('widget-product-details').innerHTML);
        for (var x in widgetInput) $("[assort-itemcode=" + x + "] div:first-child").append(widgetInput[x]);
    
    });//doc ready end            
  });
