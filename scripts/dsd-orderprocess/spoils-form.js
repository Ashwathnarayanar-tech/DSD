require([
    "modules/jquery-mozu",
    "underscore",
    "modules/api",
    "hyprlive", 
    "modules/backbone-mozu",
    "dsd-orderprocess/review-cart","modules/models-product","vendor/jquery-ui.min"], 
    function ($,_, api, Hypr, Backbone,reviewcart,ProductModels) {
        var submitOrderView = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/spoils-store-address",  
            additionalEvents: {
                "keyup .search-field":"onsearchfield", 
                "blur .search-field":"hideSearchResult",
                "click .search-result-select": "selectitem",
                "click .add-item-list": "addtospoilslist",
                "click .search-result-table .remove-item-list": "removeFromlist",
                "click .add-new-line p": "clonerow",
                "blur .particular-prod-tab tbody tr td.itemnumber input": "searchitemid",
                "keyup .particular-prod-tab tbody tr td.itemnumber input": "searchitemidkeyup",
                "change .particular-prod-tab tbody tr td.itemtype select,.particular-prod-tab tbody tr td.quntity input,.particular-prod-tab tbody tr td.reasoncode select": "changedata",
                "change .mob-added-res .mob-prod-details div input,.mob-added-res .mob-prod-details div select": "changedata",
                //"change .particular-prod-tab tbody tr td.quntity input": "changedata",
                //"change .particular-prod-tab tbody tr td.reasoncode select": "changedata",
                //"click #datePicker": "initiatedatepicker",review-btn
                "blur .bulk-prod-tab tbody tr td.pounds input": "changebulk",
                "change .bulk-prod-tab tbody tr td.reasoncode select": "changebulk",
                //"blur .additional-section div.float div div.float input.addinfodata,.additional-section div.float div div.float textarea.addinfodata": "readadditionalinfo",
                "click input[name=form-type]":"setsubmittype",
                "change select.select-submit-type" : "setsubmittype", 
                "click .review-btn": "reviewmodel",
                "click .edit-form": "editForm",
                "click .print-form": "printForm",
                "click .send-mail": "sendmail",
                //"blur .editable": "changeeditable",
                "click .cross": "editForm",
                "click label[for=from-type]": "changeedittype", 
                "click .crossmail": "closemailmodel",
                "keyup input[type=number]":"allownum",
                "click .mob-reson-code-tooltip label": "showtooltip",
                "click .mob-reson-code-tooltip label .mytooltip": "showtooltip",
                "click .product-list-div .mob-added-res .mob-product-code .remove-item-list": "removetheaddedspoil",
                "click .remove .remove-item-list": "removetheaddedspoil",
                "click .product-list-div .mob-input-read div label": "mobaddspoils",
                "blur .specific-prod-tab tbody tr td.itemnumber input": "searchspecid",
                "keyup .specific-prod-tab tbody tr td.itemnumber input": "searchspecidkeyup",
                "change .specific-prod-tab tbody tr td.itemtype select,.specific-prod-tab tbody tr td.quntity input,.specific-prod-tab tbody tr td.reasoncode select": "changespecdata",
                "click .remove-spec .remove-item-list":"removetheaddedspec",
                "click .add-specific-new-line p": "clonespecrow",
                "change .specific-bulk-div .mob-prod-details div input,.mob-specific-added-res .mob-prod-details div select": "changespecdata",
                "click .specific-bulk-div .mob-product-code .remove-item-list": "removetheaddedspec",
                "click .specific-bulk-div .mob-input-read div label": "mobspecaddspoils",
                "keypress .creditNumber":"SpoilReturnValidation",
                "keypress [name='repphone']":"phoneNumberFormat"
            },
            
            SpoilReturnValidation:function(e){
                if((e.which>31 && e.which<48) || (e.which>57 && e.which<65) ||
                    (e.which>64 && e.which<123) || (e.which>122 && e.which<127)){
                    return false;
                }
            },
            phoneNumberFormat:function(e){
               var currentKey = $(e.currentTarget);
                if((e.which>31 && e.which<48) || (e.which>57 && e.which<65) ||
                    (e.which>64 && e.which<123) || (e.which>122 && e.which<127)){
                    return false;
                }   
                if(currentKey.val().length===3){
                    currentKey.val(currentKey.val()+'-');
                }else if(currentKey.val().length===7){ 
                    currentKey.val(currentKey.val()+'-');
                }
            },
            removetheaddedspoil: function(e){
                var list = this.model.get("addedspoilslist");
                var productid = $(e.currentTarget).attr('data-id');
                var reasoncode = $(e.currentTarget).attr('data-reasoncode');
                var itemtype = $(e.currentTarget).attr('data-type'); 
                var myobj = [];
                var i = 1;
                var rowcount;
                if($(window).width()<1025){
                    rowcount = $(e.currentTarget).parents('.mob-added-res').attr('row-count');
                }else{
                    rowcount = $(e.currentTarget).parents('tr').attr('row-count');
                    
                }
                $.each(list,function(k,v){
                    if(v.prodId === productid && v.rowCount ===parseInt(rowcount,10) && i){
                        i = 0;    
                    }else{
                        myobj.push(v);  
                    }
                }); 
                this.model.set("addedspoilslist",myobj);
                this.render();
            },
            showtooltip: function(e){
                 $('.mob-reson-code-tooltip .mobtooletiptext').show();
                 //setTimeout(function(){ $('.mob-reson-code-tooltip .mytooltip .tooletiptext').hide(); }, 5000);  
            },
            allownum:function(e){
                 if (e.which !== 8 && e.which !== 0 && e.which !== 9 && e.which !== 38 && e.which !== 40 && (e.which < 48 || e.which > 57) && (e.which < 96 || e.which > 105)) {
                    //display error message
                    var value = $(e.currentTarget).slice(0,-1);
                    $(e.currentTarget).val(value);
                           return false;
                }else{
                    if($(e.currentTarget).parents('.pounds').length>0 && parseInt($(e.currentTarget).val(),10) > 48){
                    $(e.currentTarget).val(0);
                           return false;
                    }    
                }
            },
            closemailmodel:function(e){
                      $('.model-mail').hide();
                      $('.model-mail-h').hide();
                $('.review-model').hide();
                this.render();
                $('.model').hide();
                $('.main-overlay').hide();    
            },
            changeedittype:function(e){
                $(e.currentTarget).children('input').click();
            }, 
            onsearchfield: function(e){ 
                var self = this;
                if (window.timer) {
                    clearTimeout(window.timer);
                }
                window.timer = setTimeout(function(){self.autosuggest(e);}, 1);       
            },
            autosuggest:function(e){
                this.model.set('sugessions'); 
                var timer = window.timer = 0;
                this.changeeditable();
                this.readadditionalinfo();
                var self = this;
                var querylength = $(e.currentTarget).val().length;
                self.model.set('queryString',$(e.currentTarget).val());
                if(querylength > 0){
                    var query = $(e.currentTarget).val();
                    var target = $(e.currentTarget); 
                    var str = '';
                    var serviceurl = 'api/commerce/catalog/storefront/productsearch/suggest?query='+$.trim(query)+'&groups=Pages&pageSize=5'; 
                    api.request('GET',serviceurl).then(function(productslist){ 
                        if(productslist.suggestionGroups[0].suggestions.length){ 
                            $.each(productslist.suggestionGroups[0].suggestions,function(k,v){
                                var product = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.suggestion.productCode; 
                                });
                                if(v.suggestion.price.salePrice){
                                    v.suggestion.price.unitcost = (v.suggestion.price.salePrice/product[0].UnitsPerCase);
                                    v.suggestion.price.rate = v.suggestion.price.salePrice;
                                }else{
                                    v.suggestion.price.unitcost = (v.suggestion.price.price/product[0].UnitsPerCase);
                                    v.suggestion.price.rate = v.suggestion.price.price;
                                }
                                str += '<li class="search-result-select" unit-cost="'+v.suggestion.price.unitcost+'" data-name="'+v.suggestion.content.productName+'" data-case-cost="'+v.suggestion.price.rate+'" data-id="'+v.suggestion.productCode+'">'+v.suggestion.content.productName+' - '+v.suggestion.productCode+'</li>';
                            });
                           self.model.set('sugessions',productslist.suggestionGroups[0]);
                           $('.autosuggest ul li').remove();
                           $('.autosuggest ul').append(str);
                        }else{
                            self.model.set('sugessions');
                            $('.autosuggest ul li').remove();
                            $('.autosuggest ul').append('<li class="search-result-select">No items found</li>');
                        }
                        $(".autosuggest").show();
                       // self.render();
                        $(".autosuggest").show();
                        $(".search-field").focus();
                    },function(errorResp){
                        alert("error");
                    });
                }else{
                    self.model.set('sugessions',[]);
                    self.render();
                    $(".search-field").focus();
                }
                
            },
            hideSearchResult:function(e){
                if(!($(".autosuggest").is(':visible')))
                    $(".autosuggest").hide();
            },
            selectitem:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var prodName = $(e.currentTarget).attr("data-name");
                var prodCast = $(e.currentTarget).attr("data-case-cost");
                var prodId = $(e.currentTarget).attr("data-id");
                var unitcost = $(e.currentTarget).attr("unit-cost");
                var selecteditem = {};
                var searchlist = [];
                var repeated = false;
                // if(this.model.attributes.searchlist){ 
                //     searchlist = this.model.attributes.searchlist;
                //     $.each(searchlist,function(k,v){
                //         if(v.prodId == prodId){
                //             repeated = true;       
                //         }   
                //     });
                // }
                if(prodName && prodCast && prodId && unitcost){
                    selecteditem.prodName = prodName; 
                    selecteditem.prodCast = prodCast;
                    selecteditem.prodId = prodId;
                    selecteditem.unitcost = unitcost;
                    // if(!repeated)
                    //     searchlist.push(selecteditem);
                    this.model.set("searchlist",selecteditem);
                    this.render();
                    $(".autosuggest").hide();
                    $(".search-field").val(prodName+" - "+prodId); 
                }
            },
            addtospoilslist:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var idtoadd = $(e.currentTarget).attr("data-id");
                var searchlist = [];
                var addedlist = [];
                var alreadythere = false;
                var self = this;
                var setnull = false;
                if(this.model.get('addedspoilslist')){
                    addedlist = this.model.get('addedspoilslist');
                   /* $.each(addedlist,function(k,v){
                        if(v.prodId == idtoadd && v.reasoncode == 'CR'){
                            alreadythere = true;
                            var result = window.casecost.filter(function(f,i) {
                                return f.SKU === v.prodId; 
                            }); 
                            if(v.itemtype == "Each"){
                                if((parseFloat(((v.quentity+1)*(v.prodCast/result[0].UnitsPerCase)).toFixed(2),10)+parseFloat(window.grandtotal,10)-v.total) > 250){
                                    $('.main-overlay').show();
                                    $('.model-total').show();
                                    $('.model-total-h').show();
                                }else{
                                    v.quentity += 1;
                                    v.total = (v.quentity*(v.prodCast/result[0].UnitsPerCase)).toFixed(2); 
                                    setnull = true;
                                }
                            }else{
                                alreadythere = false;
                                // if((parseFloat(((v.quentity+1)*v.prodCast).toFixed(2),10)+parseFloat(window.grandtotal,10)-v.total) > 250){
                                //     $('.main-overlay').show();
                                //     $('.model-total').show();
                                //     $('.model-total-h').show();
                                // }else{
                                //     v.quentity += 1;
                                //     v.total = (v.quentity*v.prodCast).toFixed(2);
                                //     setnull = true;
                                // }    
                            }
                        }
                    });*/
               }
                var v = this.model.get('searchlist');
                if(v.prodName.indexOf('bulk') === -1){
                if(this.model.get('searchlist').prodId == idtoadd && (!alreadythere)){
                    
                    v.itemtype = "";
                    v.quentity = 1;
                    v.reasoncode = "";
                    if( v.itemtype !== ""){
                        var result = window.casecost.filter(function(f,i) {
                            return f.SKU === idtoadd; 
                        });
                        v.total = (v.quentity*(v.prodCast/result[0].UnitsPerCase)).toFixed(2);
                    }else{
                       v.total = 0; 
                    }
                    if((parseFloat(v.total, 10)+parseFloat(window.grandtotal,10)) > 250){
                        $('.main-overlay').show();
                        $('.model-total').show();
                        $('.model-total-h').show();
                        this.model.set("searchlist",v);
                    }else{
                        addedlist.push(v);
                        this.model.set("searchlist");
                    }
                }else if(v.prodId != idtoadd){
                    searchlist.push(v);    
                } 
                this.model.set("addedspoilslist",addedlist);
                $.each(addedlist,function(i,v){
                    v.rowCount = i; 
                });
                
                if(setnull){this.model.set("searchlist");}
                this.model.set('sugessions',[]);
                this.render();
                }else{
                  /*  var data = 1;
                    var bulk = true;
                    self.addBulkProduct(data,bulk);*/
                    self.model.set('sugessions',[]);
                    self.model.unset("searchlist"); 
                    self.render();
                    self.showBulkError();
                   /* if((parseFloat(window.grandtotal) + parseFloat(self.model.attributes.miscelbulk.casecost))<250){
                        self.model.set('sugessions',[]);
                        self.model.unset("searchlist"); 
                       // self.render();
                        self.showBulkError();
                    }*/
                    
                }
            },
            removeFromlist: function(e){
                var searchlist = [];
                this.model.unset("searchlist");
                this.model.set('sugessions',[]);
                this.render();
            },
            clonerow:function(e){
                if($(window).width()>1024){
                    var row = $("table.particular-prod-tab tbody tr").last().clone().appendTo("table.particular-prod-tab tbody");
                    row.find("input,select").val("");
                    row.find('.decraption div').html('');
                    var rowcount = parseInt(row.attr('row-count'),10)+1;
                    row.attr('row-count',rowcount);
                }else{
                    var mobclone = $('.mob-hasto-add').last().clone().appendTo(".product-list-div.mobile");
                    mobclone.find('input').val('');
                    mobclone.removeClass('mob-sample');
                    //$(".mob-hasto-add:first").removeClass('mob-sample');
                  
                }
            },
            showMaxAmtError:function(){
                $('.main-overlay').show();
                $('.model-bulk-msg').hide();
                $('.model-msg').show();
                $('.model-total').show();
                $('.model-total-h').show();
            },
            showBulkError:function(){
                $('.main-overlay').show();
                $('.model-msg').hide();
                $('.model-bulk-msg').show();
                $('.model-total').show();
                $('.model-total-h').show();
            },
            searchitemidkeyup:function(e){
                if(e.which == 13){
                    this.changeeditable();
                    this.readadditionalinfo();
                    var self = this;
                    var querylength = $(e.currentTarget).val().length;
                    if(querylength >= 3){
                        var query = $(e.currentTarget).val();
                        var target = $(e.currentTarget); 
                        var present = false;
                        var addedlist = [];
                        var v ={};
                        var rowcount = $(e.currentTarget).parents('tr').attr('row-count');
                         api.get('product', query).then(function(sdkProduct) {
                            var productslist = new ProductModels.Product(sdkProduct.data);
                            if(productslist.get('content.productName').indexOf('bulk') === -1){
                            if(productslist){
                                v.prodName = productslist.get('content.productName');
                                v.prodCast = productslist.get('price.price');
                                v.prodId = productslist.get('productCode');
                                v.itemtype = "";
                                v.quentity = 1;
                                v.reasoncode = "";
                                if(v.itemtype !== ""){
                                var result = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.prodId; 
                                }); 
                                v.total = (v.quentity*(v.prodCast/result[0].UnitsPerCase)).toFixed(2);
                                }else{
                                    v.total = 0;
                                }
                                if(self.model.attributes.addedspoilslist){
                                    addedlist = self.model.attributes.addedspoilslist;
                                    $.each(addedlist,function(k,val){
                                        if(val.rowCount === parseInt(rowcount,10)){
                                            addedlist.splice(k,1,v);
                                            present = true;
                                        }
                                        
                                    });
                                   /* $.each(addedlist,function(k,val){
                                        if(val.prodId == query && val.reasoncode == 'CR'){
                                            if(val.itemtype == "Each"){
                                                if((parseFloat(window.grandtotal,10)+parseFloat(1*(val.prodCast/result[0].UnitsPerCase),10)) < 250){   
                                                    present = true;
                                                    val.quentity += 1;
                                                    val.total = (val.quentity*(val.prodCast/result[0].UnitsPerCase)).toFixed(2);
                                                }else{
                                                  $('.main-overlay').show();
                                                  $('.model-total').show();
                                                  $('.model-total-h').show();
                                                }
                                            }else{
                                                present = false;
                                                // if((parseFloat(window.grandtotal,10)+parseFloat(1*val.prodCast,10)) < 250){
                                                //     present = true;
                                                //     val.quentity += 1;
                                                //     val.total = (val.quentity*val.prodCast).toFixed(2);
                                                // }else{
                                                //   $('.main-overlay').show();
                                                //   $('.model-total').show();
                                                //   $('.model-total-h').show();
                                                // }   
                                                }
                                            }
                                        });*/
                                    }
                                if(!present){
                                    if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                        addedlist.push(v); 
                                    }else{
                                            self.showMaxAmtError();
                                        }
                                    }
                                     $.each(addedlist,function(i,v){
                                        v.rowCount = i; 
                                    });
                                    self.model.set('addedspoilslist',addedlist);
                                    self.render();
                                }else{
                                    $(e.currentTarget).val('');
                                    $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                                    setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                                }
                            }else{
                                /*var data = 1;
                                var bulk = true;
                                self.addBulkProduct(data,bulk);
                                self.render();*/
                                self.render();
                                self.showBulkError();
                               /* if((parseFloat(window.grandtotal) + parseFloat(self.model.attributes.miscelbulk.casecost))<250){
                                    self.showBulkError();
                                }*/
                                
                                
                            }
                        },function(errorResp){
                            $(e.currentTarget).val('');
                            $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                        });
                    }    
                }
            },
            searchitemid:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self = this;
                var querylength = $(e.currentTarget).val().length;
                var query = $(e.currentTarget).val();
                var target = $(e.currentTarget);
                if(querylength >= 3){ 
                        var present = false;
                        var addedlist = [];
                        var v ={};
                        var rowcount = $(e.target).parents('tr').attr('row-count');
                         api.get('product', query).then(function(sdkProduct) {
                            var productslist = new ProductModels.Product(sdkProduct.data);
                            if(productslist.get('content.productName').indexOf('bulk') === -1){
                            if(productslist){
                                v.prodName = productslist.get('content.productName');
                                v.prodCast = productslist.get('price.price');
                                v.prodId = productslist.get('productCode');
                                v.itemtype = "";
                                v.quentity = 1;
                                v.reasoncode = "";
                                if(v.itemtype !== ""){
                                var result = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.prodId; 
                                });
                                v.total = (v.quentity*(v.prodCast/result[0].UnitsPerCase)).toFixed(2);
                                }else {
                                    v.total = -0;
                                }
                                if(self.model.attributes.addedspoilslist){
                                    addedlist = self.model.attributes.addedspoilslist;
                                    $.each(addedlist,function(k,val){
                                        if(val.rowCount === parseInt(rowcount,10)){
                                            addedlist.splice(k,1,v);
                                            present = true;
                                            }
                                            
                                        });
                                        
                                 /*   $.each(addedlist,function(k,val){
                                        if(val.prodId == query && val.reasoncode == 'CR' ){
                                            if(val.itemtype == "Each"){
                                                if((parseFloat(window.grandtotal,10)+parseFloat(1*(val.prodCast/result[0].UnitsPerCase),10)) < 250){
                                                    present = true;
                                                    val.quentity += 1;
                                                    val.total = (val.quentity*(val.prodCast/result[0].UnitsPerCase)).toFixed(2);
                                                }else{
                                                  $('.main-overlay').show();
                                                  $('.model-total').show();
                                                  $('.model-total-h').show();
                                                }
                                            }else{
                                                 present = false;
                                                // if((parseFloat(window.grandtotal,10)+parseFloat(1*val.prodCast,10)) < 250){
                                                //     present = true;
                                                //     val.quentity += 1;
                                                //     val.total = (val.quentity*val.prodCast).toFixed(2);
                                                // }else{
                                                //   $('.main-overlay').show();
                                                //   $('.model-total').show();
                                                //   $('.model-total-h').show();
                                                // }    
                                                }
                                            }
                                        });*/
                                    }
                                if(!present){
                                    if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                        addedlist.push(v); 
                                        }else{
                                            self.showMaxAmtError();
                                        }
                                    }
                                $.each(addedlist,function(i,v){
                                    v.rowCount = i; 
                                });
                                self.model.set('addedspoilslist',addedlist);
                                self.render();
                            }else{
                                $(e.currentTarget).val('');
                                $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                                setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                            }
                        }else{
                                /*var data = 1;
                                var bulk = true;
                                self.addBulkProduct(data,bulk);*/
                                self.render();
                                self.showBulkError();
                               /* if((parseFloat(window.grandtotal) + parseFloat(self.model.attributes.miscelbulk.casecost))<250){
                                    self.showBulkError();
                                }*/
                               //  self.render();
                                
                                
                            }  
                        },function(errorResp){
                            $(e.currentTarget).val('');
                            $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                        });
                    }
            },
            mobaddspoils: function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self = this; 
                var query = $(e.currentTarget).parents('.mob-input-read').children('input').val();
                var target = $(e.currentTarget);
                if(query.length >= 3){
                    var present = false;
                    var addedlist = [];
                    var v ={};
                     api.get('product', query).then(function(sdkProduct) { 
                        var productslist = new ProductModels.Product(sdkProduct.data);
                        if(productslist.get('content.productName').indexOf('bulk') === -1){
                        if(productslist){
                            v.prodName = productslist.get('content.productName');
                            v.prodCast = productslist.get('price.price');
                            v.prodId = productslist.get('productCode');
                            v.itemtype = "";
                            v.quentity = 1;
                            v.reasoncode = "";
                            if(v.itemtype !== ""){
                            var result = window.casecost.filter(function(f,i) {
                                return f.SKU === v.prodId; 
                            });
                            v.total = (v.quentity*(v.prodCast/result[0].UnitsPerCase)).toFixed(2);
                            }else{
                                v.total = 0;
                            }
                            if(self.model.attributes.addedspoilslist){
                                addedlist = self.model.attributes.addedspoilslist;
                                /*$.each(addedlist,function(k,val){
                                        if(val.rowCount === parseInt(rowcount)){
                                            addedlist.splice(k,1,v);
                                            present = true;
                                        }
                                        
                                    });*/
                                
                              /* $.each(addedlist,function(k,val){
                                    if(val.prodId == query && val.reasoncode == 'CR'){
                                        if(val.itemtype == "Each"){
                                            if((parseFloat(window.grandtotal,10)+parseFloat(1*(val.prodCast/result[0].UnitsPerCase),10)) < 250){
                                                present = true;
                                                val.quentity += 1;
                                                val.total = (val.quentity*(val.prodCast/result[0].UnitsPerCase)).toFixed(2);
                                            }else{
                                              $('.main-overlay').show();
                                              $('.model-total').show();
                                              $('.model-total-h').show();
                                            }
                                        }else{
                                             present = false;  
                                            // if((parseFloat(window.grandtotal,10)+parseFloat(1*val.prodCast,10)) < 250){
                                            //     present = true;
                                            //     val.quentity += 1;
                                            //     val.total = (val.quentity*val.prodCast).toFixed(2);
                                            // }else{
                                            //   $('.main-overlay').show();
                                            //   $('.model-total').show();
                                            //   $('.model-total-h').show();
                                            // }    
                                            }
                                        }
                                    });*/
                                }
                            if(!present){
                                if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                    addedlist.push(v); 
                                }else{
                                        self.showMaxAmtError();
                                    }
                                }
                            $.each(addedlist,function(i,v){
                                    v.rowCount = i; 
                                });
                            self.model.set('addedspoilslist',addedlist);
                            self.render();
                        }else{
                            $(e.currentTarget).parents('.mob-input-read').children('input').val('');
                            $(e.currentTarget).parents('.mob-hasto-add').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.mob-hasto-add').find('.error').removeClass('active');},2000); 
                        }
                     }else{
                           /* var data = 1;
                            var bulk = true;
                            self.addBulkProduct(data,bulk);
                            self.render();*/
                            self.render();
                            self.showBulkError();
                            /*if((parseFloat(window.grandtotal) + parseFloat(self.model.attributes.miscelbulk.casecost))<250){
                                self.showBulkError();
                            }*/
                            
                     }            
                    },function(errorResp){
                        $(e.currentTarget).parents('.mob-input-read').children('input').val('');
                        $(e.currentTarget).parents('.mob-hasto-add').find('.error').addClass('active');
                        setTimeout(function(){$(e.currentTarget).parents('.mob-hasto-add').find('.error').removeClass('active');},2000);
                    });
                       
                }
            },
            changedata:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self=this;
                var valuetochange = $(e.currentTarget).val();
                var idtochange = $(e.currentTarget).attr("data-id");
                var typetochange = $(e.currentTarget).attr("data-type");
                var typetoreasoncode = $(e.currentTarget).attr("data-reasoncode");  
                var parent = $(e.currentTarget).parent().attr("class");
                var itemtype = false ; var quntity = false ; var reasoncode =false;
                var rowcount = $(e.target).parents('tr').attr('row-count');
                if($(window).width()<1025) {rowcount = $(e.target).parents('.mob-added-res').attr('row-count');}
                if($(e.currentTarget).parent().hasClass("itemtype")){ itemtype = true;}
                else if($(e.currentTarget).parent().hasClass("quntity")){ quntity = true; }
                else if($(e.currentTarget).parent().hasClass("reasoncode")){ reasoncode = true; }
                if(idtochange){
                    var addedlist = this.model.attributes.addedspoilslist;
                    $.each(addedlist,function(k,val){
                        if(val.prodId === idtochange  && val.rowCount === parseInt(rowcount,10) ){    
                            var result = window.casecost.filter(function(f,i) {
                                return f.SKU === val.prodId; 
                            });
                            if(itemtype){
                                if(valuetochange === "Each"){
                                    if(((parseFloat((parseFloat(val.quentity,10)*(val.prodCast/result[0].UnitsPerCase)).toFixed(2),10)+parseFloat(window.grandtotal,10))-(val.total)) < 250){
                                        val.itemtype = valuetochange;
                                        val.quentity = parseFloat(val.quentity,10);
                                        val.total = (val.quentity*(val.prodCast/result[0].UnitsPerCase)).toFixed(2); 
                                    }else{
                                        self.showMaxAmtError();
                                    }
                                }else if(valuetochange === "Case"){
                                    if(((parseFloat((parseFloat(val.quentity,10)*val.prodCast).toFixed(2),10)+parseFloat(window.grandtotal,10))-(val.total)) < 250){
                                        val.itemtype = valuetochange;
                                        val.quentity = parseFloat(val.quentity,10); 
                                        val.total = (val.quentity*val.prodCast).toFixed(2); 
                                    }else{
                                       self.showMaxAmtError();
                                    }    
                                }
                                else if(valuetochange === ""){
                                    val.itemtype = valuetochange;
                                    val.quentity = parseFloat(val.quentity,10); 
                                    val.total = 0;
                                }
                            }else if(quntity){  
                                if(val.itemtype === "Each"){
                                    if(((parseFloat((parseFloat(valuetochange,10)*(val.prodCast/result[0].UnitsPerCase)).toFixed(2),10)+parseFloat(window.grandtotal,10))-(val.total)) < 250){
                                        val.quentity = parseFloat(valuetochange,10);
                                        val.total = (val.quentity*(val.prodCast/result[0].UnitsPerCase)).toFixed(2); 
                                    }else{
                                        self.showMaxAmtError();
                                    }    
                                }else if(val.itemtype === "Case"){
                                    if(((parseFloat((parseFloat(valuetochange,10)*val.prodCast).toFixed(2),10)+parseFloat(window.grandtotal,10))-(val.total)) < 250){
                                        val.quentity = parseFloat(valuetochange,10);
                                        val.total = (val.quentity*val.prodCast).toFixed(2); 
                                    }else{
                                        self.showMaxAmtError();
                                    }   
                                }    
                                else{
                                    val.quentity =  parseFloat(valuetochange,10); 
                                    val.total = 0;
                                }
                                
                            }else if(reasoncode){
                                val.reasoncode = valuetochange; 
                            }
                        }
                    });
                    
                    if(addedlist){
                        $.each(addedlist,function(i,v){
                                            v.rowCount = i; 
                                        });
                        this.model.set('addedspoilslist',addedlist);   
                        this.render();
                        if(itemtype){
                            $('.particular-prod-tab tr[row-count="'+rowcount+'"]').find('.quntity input').focus();
                        }else if(quntity){
                            $('.particular-prod-tab tr[row-count="'+rowcount+'"]').find('.reasoncode select').focus();
                        }else if(reasoncode){
                             $('.particular-prod-tab tr[row-count="'+rowcount+'"]').find('.reasoncode select').focus();
                        }
                    }
                }
                // var test = [];
                // var newdata = [];
                // $.each(addedlist,function(k,value){
                //     $.each(addedlist,function(key,vv){
                //         if(value.prodId == vv.prodId){
                //             if(value.reasoncode == vv.reasoncode && value.itemtype == vv.itemtype){
                //                 if(newdata.quentity){
                //                     newdata.quentity += parseFloat(value.quentity,10); 
                //                 }else{
                //                     newdata.quentity = parseFloat(value.quentity,10);   
                //                 }  
                //                 newdata.reasoncode = value.reasoncode;
                //                 newdata.itemtype =  value.itemtype;
                //                 if(newdata.total){
                //                   newdata.total += parseFloat(value.total,10); 
                //                 }else{
                //                     newdata.total = parseFloat(value.total,10);    
                //                 }
                //                 newdata.prodId = value.prodId;
                //                 newdata.prodName = value.prodName;
                //                 newdata.prodCast = value.prodCast;
                //             }   
                //         }
                //     });
                // }); 
                // var i = 1;
                // $.each(addedlist,function(k,v){
                //     if(v.prodId == newdata.prodId && v.reasoncode == newdata.reasoncode && v.itemtype == newdata.itemtype && i){
                //         test.push(newdata);    
                //             i = 0;
                //     }else{
                //         test.push(v);
                //     }
                // });
                // newdata = []; 
                
            },
            // initiatedatepicker: function(){
            //     $( "#datePicker" ).datepicker({ minDate: 0 });    
            // },
            addBulkProduct:function(data,bulk){
                var self = this;
                if(this.model.get('miscelbulk')){
                    var dataVal = parseInt(data,10);
                    var total = 0;
                    var bulkQty = parseInt($('.pounds input').val(),10);
                    var qty = parseInt(this.model.attributes.miscelbulk.weightinpounds,10);
                    if(dataVal && bulk){
                         var totalQty  = qty+dataVal;
                         total = parseFloat((this.model.attributes.miscelbulk.casecost*totalQty).toFixed(2),10)+parseFloat(window.grandtotal,10)-parseFloat(this.model.attributes.miscelbulk.total);
                         dataVal = totalQty;
                    }else if(dataVal){
                        total = parseFloat((this.model.attributes.miscelbulk.casecost*dataVal).toFixed(2),10)+parseFloat(window.grandtotal,10)-parseFloat(this.model.attributes.miscelbulk.total);
                    }
                    
                    if(total < 250){
                        this.model.attributes.miscelbulk.weightinpounds = dataVal;
                        this.model.attributes.miscelbulk.total = parseFloat(this.model.attributes.miscelbulk.casecost * this.model.attributes.miscelbulk.weightinpounds).toFixed(2); 
                    }else{
                        self.showMaxAmtError();
                    }        
                }        
                else {
                    if((parseFloat(5.20*data,10)+parseFloat(window.grandtotal,10)) < 250){
                        var bulkdata = {};
                        bulkdata.weightinpounds = data;
                        bulkdata.reasoncode = 'CR';
                        bulkdata.casecost = (5.20).toFixed(2);
                        bulkdata.total = (bulkdata.casecost*bulkdata.weightinpounds).toFixed(2);
                        this.model.set('miscelbulk',bulkdata);
                    }else{
                        self.showMaxAmtError();
                    }
                }
            },
            changebulk:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var pounds = $(e.currentTarget).parent().hasClass('pounds');
                var resonnCode = $(e.currentTarget).parent().hasClass('reasoncode');
                if(pounds){
                    var data = $(e.currentTarget).val(); 
                    if(data === ""){
                        data = 0;
                    }
                     this.addBulkProduct(data);
                    /*if(this.model.attributes.miscelbulk){
                        if((parseFloat((this.model.attributes.miscelbulk.casecost*data).toFixed(2),10)+parseFloat(window.grandtotal,10))-(this.model.attributes.miscelbulk.total) < 250){
                            this.model.attributes.miscelbulk.weightinpounds = data;
                            this.model.attributes.miscelbulk.total = (this.model.attributes.miscelbulk.casecost*this.model.attributes.miscelbulk.weightinpounds).toFixed(2);    
                        }else{
                            $('.main-overlay').show();
                            $('.model-total').show();
                            $('.model-total-h').show();
                        }
                    }else{*/
                       
                        /*if((parseFloat(52.00*data,10)+parseFloat(window.grandtotal,10)) < 250){
                            var bulkdata = {};
                            bulkdata.weightinpounds = data;
                            bulkdata.reasoncode = 'CR';
                            bulkdata.casecost = (52.00).toFixed(2);
                            bulkdata.total = (bulkdata.casecost*bulkdata.weightinpounds).toFixed(2);
                            this.model.set('miscelbulk',bulkdata);
                        }else{
                            $('.main-overlay').show();
                            $('.model-total').show();
                            $('.model-total-h').show();
                        }*/
                    //}
                    
                }else if(resonnCode){
                    var resoncode = $(e.currentTarget).val();
                    if(this.model.attributes.miscelbulk){
                        this.model.attributes.miscelbulk.reasoncode = resoncode;
                    }else{
                        var bulkdatar = {};
                        bulkdatar.weightinpounds = 0;
                        bulkdatar.reasoncode = resoncode;
                        bulkdatar.casecost = (5.20).toFixed(2);
                        bulkdatar.total = (bulkdatar.casecost*bulkdatar.weightinpounds).toFixed(2);
                        this.model.set('miscelbulk',bulkdatar);   
                    }
                }
                this.render();
                /*if(pounds || resonnCode){
                    $('.product-bulk-div').find('.reasoncode select').focus();
                }*/
            },
            setsubmittype:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                if("Spoils" == $(e.currentTarget).val()){
                    this.model.set("pickupreqmsg",'Please indicate whether this form is for Spoils or Pick-Up');
                    this.model.set("pickupreq",false);
                    this.model.get('additionalinfo').comments = "";
                }else if("Pick-Up-Request" == $(e.currentTarget).val()){
                    this.model.set("pickupreq",true); 
                    this.model.set("pickupreqmsg",'Pick-Up Request(4 Cases or More)');
                    this.model.get('additionalinfo').commentsSpoils = "";
                }
                this.render();
            },
            readadditionalinfo:function(e){
                
                var additionalinfo = {};
                if(!this.model.attributes.additionalinfo){

                        additionalinfo.storeref = $('input[name=storeref]').val();
                        additionalinfo.repname = $('input[name=repname]').val();
                        additionalinfo.repphone = $('input[name=repphone]').val();
                        additionalinfo.repmail = $('input[name=repmail]').val();
                        additionalinfo.additionalemail = $('input[name=additionalemail]').val();
                        additionalinfo.numberofmastercases = $('input[name=numberofmastercases]').val();
                        additionalinfo.comments = $('textarea[name=comments]').val();
                        additionalinfo.commentsSpoils =  $('textarea[name=comments-spoils]').val();

                    this.model.set('additionalinfo',additionalinfo);
                }else{ 

                    this.model.attributes.additionalinfo.storeref = $('input[name=storeref]').val();
                    this.model.attributes.additionalinfo.repname = $('input[name=repname]').val();
                    this.model.attributes.additionalinfo.repphone = $('input[name=repphone]').val();
                    this.model.attributes.additionalinfo.repmail = $('input[name=repmail]').val();
                    this.model.attributes.additionalinfo.additionalemail = $('input[name=additionalemail]').val();
                    this.model.attributes.additionalinfo.numberofmastercases = $('input[name=numberofmastercases]').val();
                    this.model.attributes.additionalinfo.comments = $('textarea[name=comments]').val();
                    this.model.attributes.additionalinfo.commentsSpoils =  $('textarea[name=comments-spoils]').val();
                }
                //this.render();
            },
            reviewmodel:function(e) {
                this.changeeditable();
                this.readadditionalinfo();
                this.render();
                var width = $(window).width();
                if(this.model.get('addedspoilslist')){
                var proList = this.model.get('addedspoilslist');
                var i=0;
                    for(i;i<proList.length;i++){
                        if(proList[i].itemtype === ""){
                            //alert("Please select Spoils type");
                            if(width>1024){
                                $('tr[row-count="'+proList[i].rowCount+'"]').find('.itemtype select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.section tr[row-count="'+proList[i].rowCount+'"]').offset().top},
                            'slow');
                            return false;
                            }
                            else{
                                $('.mob-added-res[row-count="'+proList[i].rowCount+'"]').find('.itemtype select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.mob-added-res[row-count="'+proList[i].rowCount+'"]').offset().top},
                                'slow');
                                return false;
                            }
                        }else if(proList[i].reasoncode === ""){
                            if(width>1024){
                                $('tr[row-count="'+proList[i].rowCount+'"]').find('.reasoncode select').css('border-color','red');
                                $('html,body').animate({
                                scrollTop: $('.section tr[row-count="'+proList[i].rowCount+'"]').offset().top},
                            'slow');
                            return false;
                            }else{
                                $('.mob-added-res[row-count="'+proList[i].rowCount+'"]').find('.reasoncode select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.mob-added-res[row-count="'+proList[i].rowCount+'"]').offset().top},
                                'slow');
                                return false;
                            }
                        }
                        
                    }
                }
                if(this.model.get('miscelbulk') && this.model.get('miscelbulk').reasoncode === "" &&  parseInt(this.model.get('miscelbulk').weightinpounds,10)>0){
                    if(width>1024){
                        $('.bulk-prod-tab .reasoncode select').css('border-color','red');
                    $('html,body').animate(
                        {
                            scrollTop: $(".product-top-section-2").offset().top
                        },
                            'slow');
                    return false;
                    }else{
                        $('.product-bulk-div .reasoncode select').css('border', 'red 1px solid !important');
                        $('html,body').animate(
                        {
                            scrollTop: $(".product-bulk-div").offset().top
                        },
                            'slow');
                        return false;
                    }
                }
                
                var self = this;
                var error = false;
                var j = 0;
                $(".addinfodata").each(function(k,v){
                    if(self.model.attributes.pickupreq){ 
                        if($(v).val() === '' && $(v).attr('name') !== "additionalemail" && $(v).attr('name') !== "storeref" && $(v).attr('name') !== 'comments-spoils'){
                            $(v).next('.error').show();
                            if(j === 0){
                                $(v).focus();
                            }
                            j++;
                            error = true;
                        }
                        if($(v).attr('name') == "repphone" && $(v).val().length < 12){
                            $(v).next('.error').show();
                            if(j === 0){
                                $(v).focus();
                            }
                            j++;
                            error = true;
                        }
                    }else{
                      if($(v).attr('name') !== 'numberofmastercases' && $(v).attr('name') !== 'comments' && $(v).attr('name') !=="additionalemail" && $(v).attr('name') !== "storeref" & $(v).attr('name') !== 'comments-spoils'){
                          if($(v).val() === ''){
                            $(v).next('.error').show();
                            if(j === 0){
                                $(v).focus();
                            }
                            j++; 
                            error = true;
                          }
                        }
                        if($(v).attr('name') == "repphone" && $(v).val().length < 12){
                            $(v).next('.error').show();
                            if(j === 0){
                                $(v).focus();
                            }
                            j++;
                            error = true;
                        }  
                    }
                });
                
                if(this.model.get('addedspecificlist')){
                var specList = this.model.get('addedspecificlist');
                var k=0;
                    for(k;k<specList.length;k++){
                        if(specList[k].itemtype === ""){
                            //alert("Please select Spoils type");
                            if(width>1024){
                                $('tr[row-count="'+specList[k].rowCount+'"]').find('.itemtype select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.section tr[row-count="'+specList[k].rowCount+'"]').offset().top},
                            'slow');
                            return false;
                            }
                            else{
                                $('.mob-added-res[row-count="'+specList[k].rowCount+'"]').find('.itemtype select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.mob-added-res[row-count="'+specList[k].rowCount+'"]').offset().top},
                                'slow');
                                return false;
                            }
                        }else if(specList[k].reasoncode === ""){
                            if(width>1024){
                                $('tr[row-count="'+specList[k].rowCount+'"]').find('.reasoncode select').css('border-color','red');
                                $('html,body').animate({
                                scrollTop: $('.section tr[row-count="'+specList[k].rowCount+'"]').offset().top},
                            'slow');
                            return false;
                            }else{
                                $('.mob-specific-added-res[row-count="'+specList[k].rowCount+'"]').find('.reasoncode select').css('border-color','red');
                                $('html,body').animate({
                                 scrollTop: $('.mob-specific-added-res[row-count="'+specList[k].rowCount+'"]').offset().top},
                                'slow');
                                return false;
                            }
                        }
                        
                    }
                }
                if(!error){
                    $('.model').show();
                    $('.main-overlay').show();
                    $(window).scrollTop(($('.review-model').offset().top-50));
                }
            },
            // Specific bulk product
            
            searchspecidkeyup:function(e){
                if(e.which == 13){
                    this.changeeditable();
                    this.readadditionalinfo();
                    var self = this;
                    var querylength = $(e.currentTarget).val().length;
                    if(querylength >= 3){
                        var query = $(e.currentTarget).val();
                        var target = $(e.currentTarget); 
                        var present = false;
                        var addedlist = [];
                        var v ={};
                        var rowcount = $(e.currentTarget).parents('tr').attr('row-count');
                         api.get('product', query).then(function(sdkProduct) {
                            var productslist = new ProductModels.Product(sdkProduct.data);
                            if(productslist.get('content.productName').indexOf('bulk') !== -1){
                            if(productslist){
                                v.prodName = productslist.get('content.productName');
                                v.prodCast = productslist.get('price.price');
                                //v.prodCast = 5.20;
                                v.prodId = productslist.get('productCode');
                                v.itemtype = "";
                                v.quentity = 1;
                                v.reasoncode = "";
                                v.itemtype = "Case";
                                v.weight = Math.floor(productslist.get('measurements').packageWeight.value);
                                if(v.itemtype !== ""){
                                var result = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.prodId; 
                                }); 
                                v.total = (v.quentity*(v.prodCast/v.weight)).toFixed(2);
                                }else{
                                    v.total = 0;
                                }
                                //v.total = (v.quentity*(v.prodCast)).toFixed(2);
                                if(self.model.attributes.addedspecificlist){
                                    addedlist = self.model.attributes.addedspecificlist;
                                    $.each(addedlist,function(k,val){
                                        if(val.rowCount === parseInt(rowcount,10)){
                                            addedlist.splice(k,1,v);
                                            present = true;
                                        }
                                        
                                    });
                                }
                                if(!present){
                                    if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                        addedlist.push(v); 
                                    }else{
                                            self.showMaxAmtError();
                                        }
                                    }
                                     $.each(addedlist,function(i,v){
                                        v.rowCount = i; 
                                    });
                                    self.model.set('addedspecificlist',addedlist);
                                    self.render();
                                }else{
                                    $(e.currentTarget).val('');
                                    $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                                    setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                                }
                            }else{
                                self.render();
                                //self.showBulkError();
                            }
                        },function(errorResp){
                            $(e.currentTarget).val('');
                            $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                        });
                    }    
                }
            },
            searchspecid:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self = this;
                var querylength = $(e.currentTarget).val().length;
                var query = $(e.currentTarget).val();
                var target = $(e.currentTarget);
                if(querylength >= 3){ 
                        var present = false;
                        var addedlist = [];
                        var v ={};
                        var rowcount = $(e.target).parents('tr').attr('row-count');
                         api.get('product', query).then(function(sdkProduct) {
                            var productslist = new ProductModels.Product(sdkProduct.data);
                            if(productslist.get('content.productName').indexOf('bulk') !== -1){
                            if(productslist){
                                v.prodName = productslist.get('content.productName');
                                v.prodCast = productslist.get('price.price');
                                //v.prodCast = 5.20;
                                v.prodId = productslist.get('productCode');
                                v.quentity = 1;
                                v.reasoncode = "";
                                v.itemtype = "Case";
                                v.weight = Math.floor(productslist.get('measurements').packageWeight.value);
                                if(v.itemtype !== ""){
                                var result = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.prodId; 
                                }); 
                                v.total = (v.quentity*(v.prodCast/v.weight)).toFixed(2);
                                }else{
                                    v.total = 0;
                                }
                                //v.total = (v.quentity*(v.prodCast)).toFixed(2);
                                if(self.model.attributes.addedspecificlist){
                                    addedlist = self.model.attributes.addedspecificlist;
                                    $.each(addedlist,function(k,val){
                                        if(val.rowCount === parseInt(rowcount,10)){
                                            addedlist.splice(k,1,v);
                                            present = true;
                                            }
                                            
                                        });
                                    }
                                if(!present){
                                    if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                        addedlist.push(v); 
                                        }else{
                                            self.showMaxAmtError();
                                        }
                                    }
                                $.each(addedlist,function(i,v){
                                    v.rowCount = i; 
                                });
                                self.model.set('addedspecificlist',addedlist);
                                self.render();
                            }else{
                                $(e.currentTarget).val('');
                                $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                                setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                            }
                        }else{
                             
                                self.render();
                                //self.showBulkError();    
                            }  
                        },function(errorResp){
                            $(e.currentTarget).val('');
                            $(e.currentTarget).parents('.itemnumber').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.itemnumber').find('.error').removeClass('active');},2000);
                        });
                    }
            },
            changespecdata:function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self=this;
                var valuetochange = $(e.currentTarget).val();
                var idtochange = $(e.currentTarget).attr("data-id");
                var typetochange = $(e.currentTarget).attr("data-type");
                var typetoreasoncode = $(e.currentTarget).attr("data-reasoncode");  
                var parent = $(e.currentTarget).parent().attr("class");
                var itemtype = false ; var quntity = false ; var reasoncode =false;
                var rowcount = $(e.target).parents('tr').attr('row-count');
                if($(window).width()<1025) {rowcount = $(e.target).parents('.mob-specific-added-res').attr('row-count');}
                if($(e.currentTarget).parent().hasClass("quntity")){ quntity = true; }
                else if($(e.currentTarget).parent().hasClass("reasoncode")){ reasoncode = true; }
                if(idtochange){
                    var addedlist = this.model.attributes.addedspecificlist;
                    $.each(addedlist,function(k,val){
                        if(val.prodId === idtochange  && val.rowCount === parseInt(rowcount,10) ){    
                            var result = window.casecost.filter(function(f,i) {
                                return f.SKU === val.prodId; 
                            });
                            if(quntity){  
                                if(val.itemtype === "Case"){
                                    if(((parseFloat((parseFloat(valuetochange,10)*(val.prodCast/val.weight)).toFixed(2),10)+parseFloat(window.grandtotal,10))-(val.total)) < 250){
                                        val.quentity = parseFloat(valuetochange,10);
                                        //val.total = (val.quentity*val.prodCast).toFixed(2);
                                        val.total = (val.quentity*(val.prodCast/val.weight)).toFixed(2); 
                                    }else{
                                        self.showMaxAmtError();
                                    }   
                                }    
                                else{
                                    val.quentity =  parseFloat(valuetochange,10); 
                                    val.total = 0;
                                }
                                
                            }else if(reasoncode){
                                val.reasoncode = valuetochange; 
                            }
                        }
                    });
                    
                    if(addedlist){
                        $.each(addedlist,function(i,v){
                                            v.rowCount = i; 
                                        });
                        this.model.set('addedspecificlist',addedlist);   
                        this.render();
                        if(itemtype){
                            $('specific-bulk-div tr[row-count="'+rowcount+'"]').find('.quntity input').focus();
                        }else if(quntity){
                            $('specific-bulk-div tr[row-count="'+rowcount+'"]').find('.reasoncode select').focus();
                        }else if(reasoncode){
                             $('specific-bulk-div tr[row-count="'+rowcount+'"]').find('.reasoncode select').focus();
                        }
                    }
                }
            },
            removetheaddedspec: function(e){
                var list = this.model.get("addedspecificlist");
                var productid = $(e.currentTarget).attr('data-id');
                var reasoncode = $(e.currentTarget).attr('data-reasoncode');
                var myobj = [];
                var i = 1;
                var rowcount;
                if($(window).width()<1025){
                    rowcount = $(e.currentTarget).parents('.mob-specific-added-res').attr('row-count');
                }else{
                    rowcount = $(e.currentTarget).parents('tr').attr('row-count');
                    
                }
                $.each(list,function(k,v){
                    if(v.prodId === productid && v.rowCount ===parseInt(rowcount,10) && i){
                        i = 0;    
                    }else{
                        myobj.push(v);  
                    }
                }); 
                this.model.set("addedspecificlist",myobj);
                this.render();
            },
            clonespecrow:function(e){
                if($(window).width()>1024){
                    var row = $("table.specific-prod-tab tbody tr").last().clone().appendTo("table.specific-prod-tab tbody");
                    row.find("input,select").val("");
                    row.find('.decraption div').html('');
                    var rowcount = parseInt(row.attr('row-count'),10)+1;
                    row.attr('row-count',rowcount);
                }else{
                    var mobclone = $('.specific-bulk-div .mob-hasto-add').last().clone().appendTo(".specific-bulk-div.mobile");
                    mobclone.find('input').val('');
                    mobclone.removeClass('mob-sample');
                    //$(".mob-hasto-add:first").removeClass('mob-sample');
                  
                }
            },
            mobspecaddspoils: function(e){
                this.changeeditable();
                this.readadditionalinfo();
                var self = this; 
                var query = $(e.currentTarget).parents('.mob-input-read').children('input').val();
                var target = $(e.currentTarget);
                if(query.length >= 3){
                    var present = false;
                    var addedlist = [];
                    var v ={};
                     api.get('product', query).then(function(sdkProduct) { 
                        var productslist = new ProductModels.Product(sdkProduct.data);
                        if(productslist.get('content.productName').indexOf('bulk') !== -1){
                        if(productslist){
                            v.prodName = productslist.get('content.productName');
                            v.prodCast = productslist.get('price.price');
                            v.prodId = productslist.get('productCode');
                            v.itemtype = "Case";
                            v.quentity = 1;
                            v.reasoncode = "";
                            v.weight = Math.floor(productslist.get('measurements').packageWeight.value);
                            if(v.itemtype !== ""){
                                var result = window.casecost.filter(function(f,i) {
                                    return f.SKU === v.prodId; 
                                }); 
                                v.total = (v.quentity*(v.prodCast/v.weight)).toFixed(2);
                            }else{
                                    v.total = 0;
                            }
                            //v.total = (v.quentity*(v.prodCast)).toFixed(2);
                            
                            if(self.model.attributes.addedspecificlist){
                                addedlist = self.model.attributes.addedspecificlist;
                                }
                            if(!present){
                                if((parseFloat(window.grandtotal,10)+parseFloat(v.total,10)) < 250){
                                    addedlist.push(v); 
                                }else{
                                        self.showMaxAmtError();
                                    }
                                }
                            $.each(addedlist,function(i,v){
                                    v.rowCount = i; 
                                });
                            self.model.set('addedspecificlist',addedlist);
                            self.render();
                        }else{
                            $(e.currentTarget).parents('.specific-bulk-div .mob-input-read').children('input').val('');
                            $(e.currentTarget).parents('.specific-bulk-div .mob-hasto-add').find('.error').addClass('active');
                            setTimeout(function(){$(e.currentTarget).parents('.specific-bulk-div .mob-hasto-add').find('.error').removeClass('active');},2000); 
                        }
                     }else{
                            self.render();
                            //self.showBulkError();    
                     }            
                    },function(errorResp){
                        $(e.currentTarget).parents('.specific-bulk-div .mob-input-read').children('input').val('');
                        $(e.currentTarget).parents('.specific-bulk-div .mob-hasto-add').find('.error').addClass('active');
                        setTimeout(function(){$(e.currentTarget).parents('.specific-bulk-div .mob-hasto-add').find('.error').removeClass('active');},2000);
                    });
                       
                }
            },
            
            
            
            
 
            editForm:function(){
                $('.model').hide();
                $('.main-overlay').hide();    
            },
            printForm:function(){
                var myhtml = $('.spoils-review-container-print').html();
                var printWin = window.open();
                printWin.document.write(myhtml);
                printWin.document.close();
                printWin.focus();
                printWin.print();
                   if( $(window).width()>1024){
                        printWin.close();
                    }
            },
            sendmail:function(){
                $('.model-overlay-mail').show();
                //var str = '';
               /* var $form=$('#spoils-submit');
                var action = $form.prop('action');
                action += (action.indexOf('?') !== -1) ? "&" : "?";
                $.getJSON(action + $form.serialize() + "&callback=?").then(function(res) {
                  if (res === "OK") {
                      $('.model-mail .model-msg').html('<p>Your Request is submitted successfully</p>');
                      $('.model-mail').show();
                      $('.model-mail-h').show();
                  } else { 
                      $('.model-mail .model-msg').html('<p>Failed,Please try again</p>');
                      $('.model-mail').show();
                      $('.model-mail-h').show();
                  }
                });*/
                
                
                var self = this;
                var retDate = self.model.get('datepick').replace('/-/g','/');
                var items = [];
                
                if(self.model.get('addedspoilslist')){
                for(var i=0;i<self.model.get('addedspoilslist').length;i++){
                    var a = {
                        SKU: self.model.get('addedspoilslist')[i].prodId, 
                        Quantity: self.model.get('addedspoilslist')[i].quentity, 
                        ReasonCode: self.model.get('addedspoilslist')[i].reasoncode,
                        UnitType: self.model.get('addedspoilslist')[i].itemtype, 
                        UnitCost: self.model.get('addedspoilslist')[i].prodCast, 
                        Total: self.model.get('addedspoilslist')[i].total,
                        Section: 1
                    };
                    items.push(a);
                    }
                }
                
                if(self.model.get('miscelbulk') && parseInt(self.model.get('miscelbulk').weightinpounds,10)>0){
                    var b = {
                        SKU:"BULK", 
                        Quantity: self.model.get('miscelbulk').weightinpounds, 
                        ReasonCode: self.model.get('miscelbulk').reasoncode, 
                        UnitCost: self.model.get('miscelbulk').casecost, 
                        Total: self.model.get('miscelbulk').total,
                        Section: 3
 
                    };
                    items.push(b);
                }
                if(self.model.get('addedspecificlist')){
                for(var j=0;j<self.model.get('addedspecificlist').length;j++){
                    var c = {
                        SKU: self.model.get('addedspecificlist')[j].prodId, 
                        Quantity: self.model.get('addedspecificlist')[j].quentity, 
                        ReasonCode: self.model.get('addedspecificlist')[j].reasoncode,
                        UnitType: self.model.get('addedspecificlist')[j].itemtype, 
                        UnitCost: self.model.get('addedspecificlist')[j].prodCast, 
                        Total: self.model.get('addedspecificlist')[j].total,
                        Section: 2
                    };
                    items.push(c);
                    }
                }
                
                
                var spoilsItem = { 
                    CustomerNumber: self.model.get('lastNameOrSurname').trim(),
                    CreateDate: new Date(),
                    ReturnDate: new Date(retDate),
                    InvoiceNumber: self.model.get('invoice').trim(),
                    PONumber: self.model.get('ponumber').trim(),
                    SpoilReturnID: self.model.get('creditnumber').trim(),
                    NumberOfMasterCases: self.model.get('additionalinfo').numberofmastercases,
                    Comments:self.model.get('additionalinfo').comments + self.model.get('additionalinfo').commentsSpoils.trim() ,
                    StoreRefNumber: self.model.get('additionalinfo').storeref.trim(),
                    RepName: self.model.get('additionalinfo').repname,
                    RepPhone: self.model.get('additionalinfo').repphone.trim(),
                    RepEmail: self.model.get('additionalinfo').repmail,
                    AdditionalEmails: self.model.get('additionalinfo').additionalemail.trim(),
                    Items: items
                };
                                    
                var ss =JSON.stringify(spoilsItem);                       
                $.ajax({
                    method:'POST',
                    url:'/svc/dsdspoils',
                    data:ss,
                    dataType: 'json',
                    contentType: 'application/json',
                    success:function(res){
                        var resp = JSON.parse(res.spoilsRes);
                        if (resp.ConfirmationNumber && resp.Success === true) {
                            $('.model-mail .model-msg').html('<p>Your Request is submitted successfully</p><br><p>Spoils Request: '+ resp.ConfirmationNumber+'</p>');
                            $('.model-mail').show();
                            $('.model-mail-h').show();
                            self.model.set('addedspoilslist',[]);
                            self.model.unset('miscelbulk');
                            self.model.set('addedspecificlist',[]);
                        } else { 
                            $('.model-mail .model-msg').html('<p>'+resp.Message+'</p>');
                            $('.model-mail').show();
                            $('.model-mail-h').show();
                           // self.model.set('addedspoilslist',[]);
                        }
                    }                         
                });
            },
            changeeditable:function(e){
                    this.model.set('brokerName', $('.broname').val()); 
                    this.model.set('invoice', $('.inv').val());
                    this.model.set('ponumber', $('.ponum').val());
                    this.model.set('creditnumber', $('.creditNumber').val());
            },
            getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                c.model.emptyobjct = [];
                c.model.bulkemptyobjct = [];
                if(!c.model.pickupreq){
                    c.model.pickupreq = false;
                }
                c.model.grandTotal = window.grandtotal = 0;
                if($.cookie('userData') !== null && $.cookie('userData')!== undefined ){
                    var rep = JSON.parse($.cookie('userData'));
                    if(!(c.model.additionalinfo)){
                        c.model.additionalinfo = [];
                    }  
                    c.model.additionalinfo.repmail = rep.email;  
                    c.model.additionalinfo.repname = rep.firstName+" "+rep.lastName;
                }
                if(!c.model.miscelbulk){
                    var bulkdata = {};
                    bulkdata.weightinpounds = 0;
                    bulkdata.reasoncode = '';
                    bulkdata.casecost = (5.20).toFixed(2);
                    bulkdata.total = (bulkdata.casecost*bulkdata.weightinpounds).toFixed(2);
                    c.model.miscelbulk = bulkdata;
                }
                if(c.model.miscelbulk){
                    c.model.grandTotal = window.grandtotal = (parseFloat(c.model.grandTotal,10)+parseFloat(c.model.miscelbulk.total,10)).toFixed(2);    
                }
                if(c.model.addedspoilslist && c.model.addedspoilslist.length>0){
                    $.each(c.model.addedspoilslist,function(k,v){
                        c.model.grandTotal = window.grandtotal = (parseFloat(c.model.grandTotal,10)+parseFloat(v.total,10)).toFixed(2);
                    });
                }
                if(c.model.addedspoilslist && c.model.addedspoilslist.length < 5){
                    for(var i = 0 ; i< (5-c.model.addedspoilslist.length);i++)
                        c.model.emptyobjct.push(i); 
                }else if(!(c.model.addedspoilslist)){
                    for(var j = 0 ; j< 5;j++)  
                        c.model.emptyobjct.push(j);    
                }
                
                if(c.model.addedspecificlist && c.model.addedspecificlist.length>0){
                    $.each(c.model.addedspecificlist,function(k,v){
                        c.model.grandTotal = window.grandtotal = (parseFloat(c.model.grandTotal,10)+parseFloat(v.total,10)).toFixed(2);
                    });
                }
                if(c.model.addedspecificlist && c.model.addedspecificlist.length < 5){
                    for(var k = 0 ; k< (5-c.model.addedspecificlist.length);k++)
                        c.model.bulkemptyobjct.push(k); 
                }else if(!(c.model.addedspecificlist)){
                    for(var l = 0 ; l< 5;l++)  
                        c.model.bulkemptyobjct.push(l);    
                }
                
                
                
                var d = new Date();
                c.model.currentDate =  ('0'+(d.getMonth()+1)).slice(-2)+ '-' + ('0'+d.getDate()).slice(-2) + '-' + d.getFullYear();
                return c;
            },
            render:function(){
                var self = this,day,month,year;
                Backbone.MozuView.prototype.render.call(this);
                $('.datePicker1').datepicker({
                    minDate:'0',
                    maxDate: '+1m',
                    dateFormat: "mm-dd-yy",	
                    onSelect: function(dateText, inst) { 
                        var date = $(this).datepicker('getDate');
                        day  = date.getDate();  
                        month = date.getMonth() + 1;              
                        year =  date.getFullYear();
                        var shipdate= ('0'+month).slice(-2)+ '-' + ('0'+day).slice(-2) + '-' + year;
                        self.model.set('datepick', shipdate);
                        //$('.estimateddate').text(shipdate);   
                    }
                });
                if(this.model.attributes.datepick){
                   var date = new Date(this.model.attributes.datepick);
						day  = date.getDate();
                        month = date.getMonth() + 1;              
                        year =  date.getFullYear();
                    var finalDate= ('0'+month).slice(-2)+ '-' + ('0'+day).slice(-2) + '-' + year;
                    $('.datePicker1').datepicker("setDate",finalDate);
                }else{
                    var date1 = new Date();
						day  = date1.getDate();  
                        month = date1.getMonth() + 1;              
                        year =  date1.getFullYear();
                    var finalDate1= ('0'+month).slice(-2)+ '-' + ('0'+day).slice(-2) + '-' + year; 
                    $('.datePicker1').datepicker("setDate",finalDate1);
                    self.model.set('datepick', finalDate1);
                }
                
            }
            
            
        });
        $(document).ready(function(){  
            var i = 0;
            var casecost = window.casecost = [];
            
            $(document).scroll(function(){
                if($( document ).width() >= 1349){
                    if($(document).scrollTop() >= 710){ 
                        $('.tooletiptext').addClass('down');    
                    }else{
                        $('.tooletiptext').removeClass('down');
                    }
                }else if($( document ).width() <= 1349 && $( document ).width() >= 768){
                     if($(document).scrollTop() >= 924){ 
                        $('.tooletiptext').addClass('downipad');     
                    }else{
                        $('.tooletiptext').removeClass('downipad');
                    }   
                }else if($( document ).width() <= 768){
                    if($(document).scrollTop() >= 1261){ 
                        $('.tooletiptext').addClass('downmob');    
                    }else{
                        $('.tooletiptext').removeClass('downmob');
                    }     
                }
            });
            $(document).on('click',function(e){
                if(!$(e.target).hasClass('search-result-select') && !$(e.target).hasClass('search-field')){
                    $(".autosuggest").hide();
                }
                if(!$(e.target).parent().hasClass('mob-reson-code-tooltip') && !$(e.target).parent().parent().hasClass('mob-reson-code-tooltip') ){
                    $('.mob-reson-code-tooltip .mobtooletiptext').hide();    
                }
            });
            $('.cross').on('click',function(){
                $('.main-overlay').hide();
                $('.model-total').hide();
                $('.model-total-h').hide();
                $('.model').hide();
            });
            //$( "#datePicker" ).datepicker({ minDate: 0 });
            var accountId= require.mozuData('user').accountId;
               api.request('GET','/api/commerce/customer/accounts/'+accountId).then(function(resp){
                    var storeAddress =  resp.contacts[0];
                    var QOModel = Backbone.MozuModel.extend({});
                    var storeadress = new submitOrderView({ 
                        el: $('#store-details'),
                        model: new QOModel(storeAddress)
                    });
                    var url1 = "api/platform/entitylists/spoils@jbelly/entities?filter=name eq casecounts";
                        api.request('GET',url1).then(function(resp) {console.log(resp);
                             window.casecost = resp.items[0].data;
                             storeadress.render();  
                        });  
                    
                    // var url = "api/platform/entitylists/spoils@jbelly/entities?pageSize=400&startIndex=0";  
                    //     api.request('GET',url).then(function(resp) {
                    //     window.casecost = resp.items[0].data;
                    //     // var result = $.grep(selected_products, function(v,i) {
                    //     //     return v[0] === 'r1';
                    //     // });  
                    //     storeadress.render();   
                    // }); 
            }); 
            //$( "#datePicker" ).datepicker({ minDate: 0 });
        });    
    }); 































