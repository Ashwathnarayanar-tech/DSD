define(['modules/backbone-mozu', 'underscore', 'modules/jquery-mozu',
'hyprlivecontext', 'hyprlive','modules/api',"dsd-orderprocess/future-popup",], 
function (Backbone, _, $, HyprLiveContext, Hypr,api,futurePopup) {

      var selectStore = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/store-selection",
            additionalEvents: {
                "click .select-txt": "selectStore",
                "click .search-store-submit":"searchdummy",
                "click .next":"next",
                "click .prev":"previous",
                "click .item[name]":"pageNumber",
                "keyup .search-store":"searchres",
                'click .store-sort-name':"sortSearch",
                'click .store-sort-accnum':"accountSort"
               
            },  
            next:function(){
                 this.itemsRange();
                 $("tr.shownow").removeClass("shownow");
                 var nextpage = parseInt($('.item.curr').attr('name'),10);
                 var pages = window.NumberOfPages;
                 var elTableRow;
                 var self = this;
                 $('.allow-prev').prop('disabled',false);
                 $('.allow-prev').removeClass('allow-prev');
                 if(pages == nextpage+1 && pages !==1){
                    $(".pagination .next").addClass('allow-prev');
                    
                 }else if(pages==1){
                    $(".pagination .prev").addClass('allow-prev');
                     $(".pagination .next").addClass('allow-prev');
                    
                 }
                  if(window.isDesktop){
                    elTableRow ="tr.desktop"; 
                }else{
                    elTableRow = "tr.mobile";  
                }
                 $.each(window.totalResult,function(i,v){
                    if(i>=nextpage*window.noOfItems && i<(nextpage*window.noOfItems)+window.noOfItems ){
                        if(window.isDesktop){
                            $(this).parents(elTableRow).addClass("shownow");
                        }else{
                            $(this).parents(elTableRow).addClass("shownow").next().addClass("shownow");
                            $(this).parents(elTableRow).next().next().addClass('shownow');
                        }
                    } 
                 });
                 $('.item').removeClass('curr');
                 $('.item[name="'+(nextpage+1)+'"]').addClass("curr");
                 $(".pagination .prev").removeClass('allow-prev');
                 $('.allow-prev').prop('disabled',true);
                 self.paginationControl(pages);
                 
            },
            previous:function(){
                this.itemsRange();
                $("tr.shownow").removeClass("shownow");
                 var prevpage = parseInt($('.item.curr').attr('name'),10)-1;
                 var pages = window.NumberOfPages;
                 var elTableRow;
                 var self = this;
                 $('.allow-prev').prop('disabled',false);
                 $('.allow-prev').removeClass('allow-prev');
                 if(prevpage==1 && pages !==1){
                    $(".pagination .prev").addClass('allow-prev');
                     
                 }else if(prevpage==1 && pages ==1){
                    $(".pagination .next").addClass('allow-prev'); 
                 }
                 if(window.isDesktop){
                    elTableRow ="tr.desktop"; 
                }else{
                    elTableRow = "tr.mobile";  
                }
                 $.each(window.totalResult,function(i,v){
                    if(i<(prevpage)*window.noOfItems && i >=(prevpage*window.noOfItems)-window.noOfItems ){
                       if(window.isDesktop){
                            $(this).parents(elTableRow).addClass("shownow");
                        }else{
                            $(this).parents(elTableRow).addClass("shownow").next().addClass("shownow");
                            $(this).parents(elTableRow).next().next().addClass('shownow');
                        }
                    } 
                 });
                 $('.item').removeClass('curr');
                 $('.item[name="'+(prevpage)+'"]').addClass("curr");
                 $('.allow-prev').prop('disabled',true);
                 self.paginationControl(pages);
                
            },
            pageNumber:function(e){
                var selectedPage = parseInt($(e.currentTarget).attr('name'),10)-1;
                 var elTableRow;
                 var self =this;
                var pages = window.NumberOfPages;
                $('.allow-prev').prop('disabled',false);
                if(pages == selectedPage+1 && selectedPage+1 == 1){
                    $(".pagination .next").addClass('allow-prev');
                    $(".pagination .prev").addClass('allow-prev');
                 }else if(pages == selectedPage+1){
                    $(".pagination .next").addClass('allow-prev');
                    $(".pagination .prev").removeClass('allow-prev');
                 }
                 else if(selectedPage+1 == 1){
                   $(".pagination .prev").addClass('allow-prev');
                   $(".pagination .next").removeClass('allow-prev');
                    
                 }else if(selectedPage+1 !== 1 && pages !== selectedPage+1){
                    $(".pagination .prev").removeClass('allow-prev');
                    $(".pagination .next").removeClass('allow-prev');
                 }
                 $("tr.shownow").removeClass("shownow");
                 if(window.isDesktop){
                    elTableRow ="tr.desktop"; 
                }else{
                    elTableRow = "tr.mobile";  
                }
                $.each(window.totalResult,function(i,v){
                    if(i>=selectedPage*window.noOfItems && i<(selectedPage*window.noOfItems)+window.noOfItems ){
                        if(window.isDesktop){
                            $(this).parents(elTableRow).addClass("shownow");
                        }else{
                            $(this).parents(elTableRow).addClass("shownow").next().addClass("shownow");
                            $(this).parents(elTableRow).next().next().addClass('shownow');
                        }
                    } 
                 });
                 $('.item').removeClass('curr');
                 $('.item[name="'+(selectedPage+1)+'"]').addClass("curr");
                 $('.allow-prev').prop('disabled',true);
                self.paginationControl(pages);
            },
            paginationControl:function(pages){
                this.itemsRange();
                $(".desktop.bg-grey.address").hide(); 
                $(".collapse-icon").removeClass("minus");
                $.each($('span.item'),function(i,v){
                    if(parseInt($(this).attr('name'),10)!==1 && parseInt($(this).attr('name'),10)!==pages && $(this).attr('name')!==undefined){
                        if($('span.curr').attr('name') == "1" && ($(this).attr('name')=="3" || $(this).attr('name')=="4")){
                            $(this).removeClass("page-hide");
                        } 
                        else if(parseInt($('span.curr').attr('name'),10) == pages && ((parseInt($(this).attr('name'),10)==pages-2 || parseInt($(this).attr('name'),10)==pages-3))){
                            $(this).removeClass("page-hide");
                        }
                        else if(!($(this).hasClass('curr') || $(this).next().hasClass('curr') || $(this).next().next().hasClass('curr') || $(this).prev().prev().hasClass('curr') || $(this).prev().hasClass('curr'))){
                            $(this).addClass("page-hide");
                        }
                        else{
                            $(this).removeClass("page-hide");
                        }
                        
                    }
                    else{
                         $(this).removeClass("page-hide");
                    }
                 });
                if(pages>4) {
                    if($('.curr').prev().prev().attr('name')==="1" || $('.curr').prev().prev().prev().attr('name')==="1" || parseInt($('.curr').attr('name'),10)==1 || parseInt($('.curr').attr('name'),10)==4){
                        $('.item[name="1"]').next().addClass('hide-dot'); 
                    }else{
                        $('.item[name="1"]').next().removeClass('hide-dot'); 
                    }
                    
                    if(parseInt($('.curr').next().next().attr('name'),10)==pages || parseInt($('.curr').next().next().next().attr('name'),10)==pages || parseInt($('.curr').attr('name'),10)==pages || parseInt($('.curr').attr('name'),10)==(pages-3)){
                        $('.item[name="'+pages+'"]').prev().addClass('hide-dot'); 
                    }else{
                        $('.item[name="'+pages+'"]').prev().removeClass('hide-dot'); 
                    }
                }
            },
            itemsRange: function(){
              var pageNo = parseInt($('.item.curr').attr('name'),10);
              var totalItems = window.totalResult.length;
              var text = $('#search-store').val();
              var pageNoBefore;
              // pageNo === 1 ? pageNoBefore = '' : pageNoBefore=(pageNo-1);
              if(pageNo ===1)
                  pageNoBefore = '';
              else
                  pageNoBefore = pageNo - 1;
              if(totalItems%10 === 0){ 
                $('.after-search-msg b').html('"'+text+'" ('+pageNoBefore+'1-'+ pageNo + '0 of ' + totalItems+' results)');
              } else {
                //$('.after-search-msg b').html('"'+text+'" ('+pageNoBefore+'1-' + (totalItems%10) + ' of ' + totalItems+' results)');
                 if(parseInt(totalItems)<=parseInt(pageNo))
                    $('.after-search-msg b').html('"'+text+'" ('+pageNoBefore+'1-'+ totalItems + ' of ' + totalItems+' results)');
                 else
                    $('.after-search-msg b').html('"'+text+'" ('+pageNoBefore+'1-'+ pageNo + '0 of ' + totalItems+' results)');
              }
            },
            searchres:function(e){
                if(e.keyCode == 13){
                    this.searchdummy();
                }
            },
            searchdummy:function(e){
                var myArray = this.model.attributes.clients;
    //             if((myArray[0].storename).split('#')[0] == (myArray[1].storename).split('#')[0]){
    //                 if(parseInt((myArray[0].storename).split('#')[1],10) > parseInt((myArray[1].storename).split('#')[1],10)){
    //                     this.model.attributes.sortresult = [];
    //                     for(var i = (myArray.length-1) ;i >= 0;i--){
    //                         this.model.attributes.sortresult.push(myArray[i]);        
    //                     }
    //                     this.render();
    //                 }
    //             }else if((myArray[0].storename).split('#')[0] > (myArray[1].storename).split('#')[0]){
				// 	var j;
    //                 this.model.attributes.sortresult = [];
    //                     for(j = (myArray.length-1) ;j >= 0;j--){
    //                         this.model.attributes.sortresult.push(myArray[j]);        
    //                     }
    //                     this.render();
    //             }
                //this.searchResult();
                var result = [];
                var self = this;
                var enteredText = $(".search-store").val();
                if(enteredText){
                    /*if(enteredText.indexOf('#')>-1){
                        enteredText = enteredText.replace(/#/g,'hash');
                    }*/
                   // var userMailId = require.mozuData("user").email;
                    var userMailId = $.cookie("userEmail");
                    api.request('GET', '/svc/b2bdirect/dsd/'+encodeURIComponent(enteredText)+'/'+userMailId).then(function(resp) {    
                    //api.request('get','/svc/b2blogins/dsd/'+enteredText).then(function(resp) {
                        result = self.dateformat(resp.clients);
                        self.model.set('sortresult',result);
                        var myarray = self.mysort(result);
                        self.model.set('sortresult','');  
                        //self.model.attributes.sortresult = myarray;
                        self.model.set('sortresult',myarray);
                        self.render();
                    });
                /*$.each(myArray,function( index, element ) {
                        var textCompare = element.storename;
                        var specials=/[*|\":<>[\]{}`\\();@&$*^]/;
                        var accNo = element.accountnumber;
                        var noOfItems = window.noOfItems = Hypr.getThemeSetting('noOfItemsPerPage');
                        if (!specials.test(enteredText)) {
                            var textExp = new RegExp(""+enteredText+"", "i");
                            if(textExp.test(textCompare)|| accNo.indexOf(enteredText)>-1){
                             // resultsCount++;
                              //totalResult.push(element);
                              result.push(element);
                            //   if(resultsCount <= noOfItems){
                            //         parentTableRow = $(this).parents("tr");
                            //         parentTableRow.addClass("shownow");
                            //         if(parentTableRow.hasClass("mobile")){
                            //             parentTableRow.next().addClass("shownow").next().addClass("shownow");
                            //         }
                                
                            //   }
                            }
                        }
                    });
                     this.model.set('sortresult',result);
                    myarray = this.mysort(this.model.attributes.sortresult);
                    this.model.attributes.sortresult = []; 
                    this.model.attributes.sortresult = myarray;
                    this.render();*/
                }else{
                    $('.error-search-msg').html('<span style="color:red">Please enter a minimum of 3 characters</span>').show();
                    $(".store-search-result").hide();
                }
               
        },
        dateformat : function(stores){
            var i= 0, len = stores.length,self=this;
            
            for(i;i<len;i++){
                if(stores[i].lastorderdate !== null ){
                    var d = stores[i].lastorderdate.split('T');
                    var date = d[0].split('-');
                    var fullDate = self.getMonth(date[1])+" "+ date[2]+", "+date[0];
                    stores[i].lastorderdate = fullDate;
                }
            }
            return stores;
        },
        getMonth:function (month){
            switch(parseInt(month,10)){
                case 01: 
                    return "January";
                
                case 02:
                    return "February";
                
                case 03:
                    return "March";
                
                case 04: 
                    return "April";
                    
                case 05:
                    return  "May";
                    
                case 06:
                    return "June";
                
                case 07:
                    return "July";
                
                case 08:
                    return "August";
                    
                case 09: 
                    return "September";
                
                case 10: 
                    return "October";
                
                case 11:
                    return "November";
                    
                case 12: 
                    return "December";
            }
        },
            searchResult:function(){
                $("tr.shownow").removeClass("shownow");
                var enteredText = $('#search-store').val(); 
                var resultsCount = 0; 
                var parentTableRow;
                var totalResult = [],elTableRow;
                if(enteredText.trim().length > 2){
                   $('.no-results-found').remove(); 
                   $('.store-search-result').show();
                if(window.isDesktop){
                    elTableRow ="tr.desktop"; 
                }else{
                    elTableRow = "tr.mobile";  
                }
               $(elTableRow+" .new-store-name").each(function( index, element ) {
                        /*var textCompare =$(element).text().trim();
                        var specials=/[*|\":<>[\]{}`\\();@&$*^]/;
                        var accNo = $(this).parent('td').next().find('div').text();
                        var mobAcc = $(this).parents('tr').next().find('.account-no').text();*/
                        var noOfItems = window.noOfItems = Hypr.getThemeSetting('noOfItemsPerPage');
                        // if (!specials.test(enteredText)) {
                            // var textExp = new RegExp(""+enteredText+"", "i");
                            // if(textExp.test(textCompare)|| accNo.indexOf(enteredText)>-1 || mobAcc.indexOf(enteredText)>-1){
                              resultsCount++;
                              totalResult.push(element);
                              if(resultsCount <= noOfItems){
                                    parentTableRow = $(this).parents("tr");
                                    parentTableRow.addClass("shownow");
                                    if(parentTableRow.hasClass("mobile")){
                                        parentTableRow.next().addClass("shownow").next().addClass("shownow");
                                    }
                                
                              }
                            // }
                        // }
                    });
                    
                    if(resultsCount>0){
                        window.totalResult = totalResult;
                        var NumberOfPages = window.NumberOfPages = Math.ceil(resultsCount/window.noOfItems);
                        var paginateItems = [];
                        for(var i=2;i<=NumberOfPages; i++){
                            if(i>4){
                                if(i === NumberOfPages){
                                    paginateItems.push("<span class='show-dot'>. . .</span><span class='item' name='"+i+"'>"+i+"</span>");
                                }else{
                                    paginateItems.push("<span class='item page-hide' name='"+i+"'>"+i+"</span>");
                                }
                            }else{
                                paginateItems.push("<span class='item' name='"+i+"'>"+i+"</span>");
                            }
                        } 
                        $(".pagination").html('<span class="item prev"><</span><span class="item curr" name="1">1</span><span class="hide-dot show-dot">. . .</span>'+ paginateItems.join("")+'<span class="item next">></span>').show();  
                        if(NumberOfPages == 1){
                            $(".pagination .prev").addClass('allow-prev');
                            $(".pagination .next").addClass('allow-prev');
                             $('.allow-prev').prop('disabled',true); 
                        }else{
                           $(".pagination .prev").addClass('allow-prev');
                           $('.allow-prev').prop('disabled',true); 
                        }     
                        $(".result-head").show();
                        $('.before-search-msg').hide();
                        $('.after-search-msg').html('Search results for <b>"'+enteredText+'" ( of '+window.totalResult.length+' results)</b>').show(); 
                        this.itemsRange();
                    }
                    else{
                        $(".result-head").hide();
                        $('.after-search-msg').hide();
                        $('.before-search-msg').show();
                        $(".error-search-msg").html("<h3 class='no-results-found'>Sorry, no matches. Please check the spelling and try again.</h3>").show();  
                        $(".store-search-result").hide(); 
                    } 
                    
                }else{   
                    $('.error-search-msg').html('<span style="color:red">Please enter a minimum of 3 characters</span>').show();
                    $(".store-search-result").hide();  
                }
                 
                    
            },
            selectStore:function(e){ 
               $(".overlay-full-width").show(); 
              var user = require.mozuData("user");   
              if(window.location.host.indexOf("mozu") !== -1){
                  if(window.location.host.indexOf('stg1')!==-1){
                    $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "stg1.mozu.com" });
                  }else{
                    $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "sandbox.mozu.com" });
                  }
              }else{  
                  $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "jellybellydsd.com" });     
              }
        //   if(window.location.host.indexOf("mozu") !== -1){
        //     $.cookie("userData", encodeURIComponent(user.email), {path: '/', expires: 1, domain: "sandbox.mozu.com" });
        //   }else{
        //     $.cookie("userData", encodeURIComponent(user.email), {path: '/', expires: 1, domain: "jellybellydsd.com" });
        //   }
                var self= this,i=0,len=self.model.get('clients').length,pre;
                var recentStore = [];
                var token = $(e.currentTarget).attr('token');
                var host =  $(e.currentTarget).attr('host');
                var username = $(e.currentTarget).attr('username');
                var form = $('#jb-b2bform');
                form.find('input.password').val(token);
                form.attr('action','https://' + (host || document.location.host) + '/user/login');
               // form.submit();
               // this.setLoading(true);
           
                api.action('customer', 'loginStorefront', {
                    email:username, 
                    password:token   
                }).then( function () {  
                    $.cookie("loggedInUser", username, { expires: 1, path: '/', domain: (location.href.indexOf('sandbox.mozu.com') > -1 ? '.sandbox.mozu.com' : '.jellybellydsd.com' )});   
                    form.submit();
                }, function (xhr) {
                    var msg = "There was an error when selecting the store. Please contact Jelly Belly support at 1-800-323-9380 for assistance.";
                    futurePopup.AlertView.fillmessage("",msg,
                        function(userChoice) {
                            if (userChoice) {
                                futurePopup.AlertView.closepopup();
                              
                            }else{
                                futurePopup.AlertView.closepopup();  
                            }
                        });
                });
                
            },
            orderDate:function(){
                 var desc = false,
                asc = false;
            
                var orderNumberSort = this.recentStore;
                for (var i = 0; i < orderNumberSort.length; i++) {
                    if (i !== orderNumberSort.length - 1) {
                        if (orderNumberSort[i].lastorderdate > orderNumberSort[i + 1].lastorderdate) {
                                desc = true;
                                break;
                        } else if (orderNumberSort[i].lastorderdate < orderNumberSort[i + 1].lastorderdate) {
                            asc = true;
                            break;
                        }
                    }
                }
                orderNumberSort.sort(function(a, b) {
                    var nameA, nameB;
                    if (desc) {
                        nameA = a.lastorderdate;
						nameB = b.lastorderdate;
                        if (nameA < nameB) //sort string ascending
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    } else if (asc) {
                        nameA = a.lastorderdate;
						nameB = b.lastorderdate;
                        if (nameA > nameB) //sort string ascending
                            return -1;
                        if (nameA < nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    }
                });
                 this.model.set('recentstores', orderNumberSort);
                 this.render();
            },
            
            storeName:function(){
                var myarray = [];
                var addclass = '';
                var removeclass = '';
                var testarray = this.recentStore; 
                if($("[data-mz-action='storeName']").hasClass('des')){
                    myarray = this.mysort(testarray);
                    removeclass = 'des';
                    addclass = 'ace';
                }else if($("[data-mz-action='storeName']").hasClass('ace')){
                    testarray = this.mysort(testarray);
                    for(var i =  testarray.length-1;i >= 0;i--){
                       myarray.push(testarray[i]);   
                    }
                    removeclass = 'ace';
                    addclass = 'des';
                }else{
                    myarray = this.mysort(testarray);
                    addclass = 'ace';
                }
                this.model.set('recentstores', myarray);
                this.render();
                $("[data-mz-action='storeName']").addClass(addclass);
                $("[data-mz-action='storeName']").removeClass(removeclass);
            },
            accountSort:function(){
              
                var desc = false,
                    asc = false;
                var orderNumberSort,addclass,removeclass;
                if(this.model.get('sortresult')){
                    orderNumberSort = this.model.get('sortresult');
                }
               // var mynewarray = [];
                for (var i = 0; i < orderNumberSort.length; i++) {
                    if (i !== orderNumberSort.length - 1) {
                        if (this.newSort(orderNumberSort[i].accountnumber) > this.newSort(orderNumberSort[i + 1].accountnumber)) {
                            desc = true;
                            addclass = 'ace';
                            removeclass = 'des';
                            break;
                        } else if (this.newSort(orderNumberSort[i].accountnumber) < this.newSort(orderNumberSort[i + 1].accountnumber)) {
                            asc = true;
                            addclass = 'des';
                            removeclass = 'ace';
                            break;
                        }
                    }
                }
                if (desc) {
                    orderNumberSort = this.ordernumbersort(orderNumberSort);
                } else if (asc) {
                    orderNumberSort = this.ordernumbersort(orderNumberSort);
                    var temp = orderNumberSort;
                    orderNumberSort = [];
                    for(var k = temp.length-1;k>=0;k--){
                       orderNumberSort.push(temp[k]);     
                    }
                }
    
                this.model.set('sortresult', orderNumberSort);
                this.render();
                $("[data-mz-action='storeName']").addClass(addclass);
                $("[data-mz-action='storeName']").removeClass(removeclass);
                    
            },
            ordernumbersort:function(stores){
                var self = this;
                stores.sort(function(a,b){
                    var aName = self.newSort(a.accountnumber);
                    var bName = self.newSort(b.accountnumber);
                    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                });
                return stores;    
            },
            mysort:function(stores){
                var self = this;
                var myarray = [];
                stores.sort(function(a,b){
                    var aName = self.newSort(a.storename);
                    var bName = self.newSort(b.storename);
                    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                });
                return stores;
            },
            SortByName:function(a, b){
              var aName = a.name;
              var bName = b.name; 
              return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            },
            newSort:function(value) {
                var padding = '00000000000000000000';
                value = value.replace(/(\d+)((\.\d+)+)?/g, function ($0, integer, decimal, $3) {
                    if (decimal !== $3) {
                        // treat as a series of integers,
                        // rather than a decimal
                        return $0.replace(/(\d+)/g, function ($d) {
                            return padding.slice($d.length) + $d;
                        });
                    } else {
                        decimal = decimal || ".0";
                        return padding.slice(integer.length) + integer + decimal + padding.slice(decimal.length);
                    }
                });
                return value;
            },
            sortSearch:function(){
                var self = this;
                var desc = false;
                var asc = false;
                var myArray = this.model.attributes.sortresult;
                for (var i = 0; i < myArray.length; i++) {
                    if (i !== myArray.length - 1) {
                        if (self.newSort(myArray[i].storename) > self.newSort(myArray[i+1].storename)) {
                            desc = true;
                            break;
                        } else if (self.newSort(myArray[i].storename) < self.newSort(myArray[i+1].storename)) {
                            asc = true;
                            break;
                        }
                    }
                }
                this.model.attributes.sortresult = [];
                if(desc){
                    myArray = self.mysort(myArray);
                    this.model.attributes.sortresult = myArray;
                }else if(asc){
                    myArray = self.mysort(myArray);  
                    for(var j = (myArray.length-1) ;j >= 0;j--){
                        this.model.attributes.sortresult.push(myArray[j]);        
                    }
                }else{
                    this.model.attributes.sortresult = myArray;   
                }
                this.render();
                
            },
            render:function(){
               var value =  $('.search-store').val();
                console.log(this.model);
                Backbone.MozuView.prototype.render.call(this);
                $(".loggedin-msg .mz-utilitynav-link").text($.cookie("userEmail"));
                if(value !== "" && value !== undefined){
                        $('.search-store').val(value);
                        // $('input[value=new-store]').trigger('click');
                        this.searchResult(false);
                }
            }    
      });
      
      var recentStore = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/recent-store",
            additionalEvents: {
                "click .select-txt": "selectStore"
            },
            recentStore:'',
            getRenderContext: function () {
                var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                if(!c.model.recentstores){
                    this.recentStore = this.recentStores();
                    c.model.recentstores = this.recentStore; 
                }
                return c;
            },
            selectStore:function(e){ 
                $(".overlay-full-width").show(); 
                var user = require.mozuData("user");   
                if(window.location.host.indexOf("mozu") !== -1){
                    //UCP changes
                    if(window.location.host.indexOf('stg1')!==-1){
                        $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "stg1.mozu.com" });
                      }else{
                        $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "sandbox.mozu.com" });
                      }
                   
                }else{
                    $.cookie("userData", JSON.stringify(user), {path: '/', expires: 1, domain: "jellybellydsd.com" });
                }
                /* if(window.location.host.indexOf("mozu") !== -1){
                    $.cookie("userData", encodeURIComponent(user.email), {path: '/', expires: 1, domain: "sandbox.mozu.com" });
                }else{
                    $.cookie("userData", encodeURIComponent(user.email), {path: '/', expires: 1, domain: "jellybellydsd.com" });
                } */
                var self= this,i=0,len=self.model.get('clients').length,pre;
                var recentStore = [];
                var token = $(e.currentTarget).attr('token');
                var host =  $(e.currentTarget).attr('host');
                var username = $(e.currentTarget).attr('username');
                var form = $('#jb-b2bform');
                form.find('input.password').val(token);
                form.attr('action','https://' + (host || document.location.host) + '/user/login');
                //form.submit();
                api.action('customer', 'loginStorefront', {
                    email:username, 
                    password:token   
                }).then( function () {  
                    $.cookie("loggedInUser", username, { expires: 1, path: '/', domain: (location.href.indexOf('sandbox.mozu.com') > -1 ? '.sandbox.mozu.com' : '.jellybellydsd.com' )});  
                    form.submit();
                }, function (xhr) { 
                    var msg = "There was an error when selecting the store. Please contact Jelly Belly support at 1-800-323-9380 for assistance.";
                    futurePopup.AlertView.fillmessage("",msg,
                        function(userChoice) {
                            if (userChoice) {
                                futurePopup.AlertView.closepopup();
                              
                            }else{
                                futurePopup.AlertView.closepopup();  
                            }
                        });
                });
                
            },
            recentStores:function(){
                
                var stores = this.model.get('clients');
                var newstores = [];
               $.each(stores,function(k,v){
                    /*if(this.lastorderdate){
                        if(newstores.length<5){
                            
                            newstores.push(this);
                        }
                    }*/
                });
                //return this.dateformat(newstores);
                return stores;
            }, 
            
            orderDate:function(){
                 var desc = false,
                asc = false;
            
                var orderNumberSort = this.recentStore;
                for (var i = 0; i < orderNumberSort.length; i++) {
                    if (i !== orderNumberSort.length - 1) {
                        if (orderNumberSort[i].lastorderdate > orderNumberSort[i + 1].lastorderdate) {
                                desc = true;
                                break;
                        } else if (orderNumberSort[i].lastorderdate < orderNumberSort[i + 1].lastorderdate) {
                            asc = true;
                            break;
                        }
                    }
                }
                orderNumberSort.sort(function(a, b) {
                    var nameA, nameB;
                    if (desc) {
                        nameA = a.lastorderdate;
						nameB = b.lastorderdate;
                        if (nameA < nameB) //sort string ascending
                            return -1;
                        if (nameA > nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    } else if (asc) {
                        nameA = a.lastorderdate;
						nameB = b.lastorderdate    ;
                        if (nameA > nameB) //sort string ascending
                            return -1;
                        if (nameA < nameB)
                            return 1;
                        return 0; //default return value (no sorting)
                    }
                });
                 this.model.set('recentstores', orderNumberSort);
                 this.render();
            },
            
            storeName:function(){
                var myarray = [];
                var addclass = '';
                var removeclass = '';
                var testarray = this.recentStore; 
                if($("[data-mz-action='storeName']").hasClass('des')){
                    myarray = this.mysort(testarray);
                    removeclass = 'des';
                    addclass = 'ace';
                }else if($("[data-mz-action='storeName']").hasClass('ace')){
                    testarray = this.mysort(testarray);
                    for(var i =  testarray.length-1;i >= 0;i--){
                       myarray.push(testarray[i]);   
                    }
                    removeclass = 'ace';
                    addclass = 'des';
                }else{
                    myarray = this.mysort(testarray);
                    addclass = 'ace';
                }
                this.model.set('recentstores', myarray);
                this.render();
                $("[data-mz-action='storeName']").addClass(addclass);
                $("[data-mz-action='storeName']").removeClass(removeclass);
            },
            accountSort:function(){
              
                var desc = false,
                    asc = false;
                var orderNumberSort,removeclass,addclass;
                if(this.model.get('recentstores')){
                    orderNumberSort = this.model.get('recentstores');
                }
                else if(this.recentStore){
                    orderNumberSort = this.recentStore;    
                }
                for (var i = 0; i < orderNumberSort.length; i++) {
                    if (i !== orderNumberSort.length - 1) {
                        if (orderNumberSort[i].accountnumber > orderNumberSort[i + 1].accountnumber) {
                            desc = true;
                            addclass = 'ace';
                            removeclass = 'des';
                            break;
                        } else if (orderNumberSort[i].accountnumber < orderNumberSort[i + 1].accountnumber) {
                            asc = true;
                            addclass = 'des';
                            removeclass = 'ace';
                            break;
                        }
                    }
                }
                orderNumberSort.sort(function(a, b) {
                    if (desc) {
                        return a.accountnumber - b.accountnumber;
                    } else if (asc) {
                        return b.accountnumber - a.accountnumber;
                    }
                });
    
                this.model.set('recentstores', orderNumberSort);
                this.render();
                $("[data-mz-action='storeName']").addClass(addclass);
                $("[data-mz-action='storeName']").removeClass(removeclass);
                    
            },
            render:function(){  
                console.log(this.model);
                Backbone.MozuView.prototype.render.call(this);
            }   
            
        });
      
      
      $(document).ready(function(){
        if($.cookie("userEmail") === undefined){
            window.location = Hypr.getThemeSetting('themeLoginURL')+"?clearSession=yes";
        }

        //   if(!$(".table table-responsive").children(".recent-address").children().length){
              
        //   }
        //Remove cookie
        if(window.location.host.indexOf("mozu") !== -1){
            if(window.location.host.indexOf('stg1')!==-1){
                $.cookie("userData", '', {path: '/', expires: -1, domain: "stg1.mozu.com" });
              }else{
                $.cookie("userData", '', {path: '/', expires: -1, domain: "sandbox.mozu.com" });
              }
            
        }else{
            $.cookie("userData", '', {path: '/', expires: -1, domain: "jellybellydsd.com" });
        }
          if($(window).width()>1024){
            var isDesktop = window.isDesktop = true;
          }
           var QOModel = Backbone.MozuModel.extend({});
           //var userMailId = require.mozuData("user").email;
           var userMailId = $.cookie("userEmail");
           api.request('GET', '/svc/b2bdirect/dsd/recent/'+userMailId).then(function(resp) {
           //api.request('GET', '/svc/b2blogins/dsd/recent').then(function(resp) { 
                resp.clients = dateformat(resp.clients);
                  var recentstore = new recentStore({
                    el: $('.recent-stores-main'),
                    model: new QOModel(resp)
                });
                recentstore.render();
                 $('input[type="radio"]').removeAttr('disabled');
                
               // var test = myobjsort(resp.clients);
               // var newobj = {};
             /*   $.each(resp,function(k,v){
                   
                        resp[k] = v;
                    
                });*/
               // resp["sortresult"] = test;
                var selectstore = new selectStore({
                        el: $('#store-section'),
                        model: new QOModel(resp)   
                    });
                    selectstore.render(); 
                    
                
                /*var el = $('.jb-userlogins');
                if (resp.total === 0) {
                    el.append('<div>none found</div>');
                    return;
                }

                var form = document.getElementById('jb-b2bform');
                form.method = 'POST';
                var ul = $('<ul>');
                el.append(ul);
                var li;
                //jb-b2bform"
				console.log(resp);
                resp.clients.forEach(function(user) {
                    li = $('<li>');
                    ul.append(li);
                    console.log(user);
                    var a = $('<a style="cursor:pointer">' + user.storename + '(' + user.username + '  - ' + user.site + ')</a>');
                    var loginFn = function() {
                        form.username.value = 'test@test.com';
                        form.password.value = user.token;
                        form.action = 'https://' + (user.host || document.location.host) + '/user/login';
                        form.target = '_blank';
                        form.submit();
                    };
                    a.click(loginFn);
                    li.append(a);

                });*/

            });
            
            $(document).on('click','input[type="radio"]',function(){
               $('.tabs').hide();    
               if($('.tabs').hasClass($(this).val())){
                   if($(this).val() == "recent-store" ){
                       $('.'+$(this).val()).show();
                       $('.active-contain').hide(); 
                   }else{
                        $('.'+$(this).val()).show();
                        $('.active-contain').show();
                   }
                }
            });
            
             $(document).on("click", ".recent-store .collapse-icon",function(e){
                if($(e.currentTarget).parent().parent().parent().parent().find('.addres').is(':hidden')){
                    if($(e.currentTarget).hasClass('minus')){
                        $(e.currentTarget).removeClass('minus');
                        $('.recent-store .addres').hide();
                    }else{
                        $('.recent-store .minus').removeClass('minus');
                        $('.recent-store .addres').hide();
                        $(e.currentTarget).addClass('minus');
                        $(e.currentTarget).parent().parent().parent().parent().find('.addres').show();
                    }
                    
                } else{
                        $(e.currentTarget).parent().parent().parent().parent().find('.addres').hide();
                        $(e.currentTarget).removeClass('minus');
                        
                        
                    }
             });
           
             
             $(document).on("click",".search-store .collapse-icon",function(){
                if($(this).hasClass("minus")){
                    $(this).removeClass('minus');
                    $(this).parents('tr').next().hide();
                    $(this).parent().parent().parent().removeClass('no-border-bottom');
                }else{
                    $(".search-store .collapse-icon.minus").removeClass("minus"); 
                    $(this).addClass('minus');  
                    $("tr.address").hide();
                    $(this).parent().parent().parent().addClass('no-border-bottom');
                    $(this).parents('tr').next().show();
                }
            });
           /* var recentSort = function(stores){
                 stores.sort(function(a,b){
                    if(a.lastorderdate === null){
                      return 1;
                    }
                    else if(b.lastorderdate === null){
                      return -1;
                    }
                    else if(a.lastorderdate === b.lastorderdate){
                      return 0;
                    }else {
                      return a.lastorderdate < b.lastorderdate ? 1 : -1;
                    }
                });
                return dateformat(stores);
            };*/
             var dateformat =function(stores){
                var i= 0, len = stores.length;
                
                for(i;i<len;i++){
                    if(stores[i].lastorderdate !== null ){
                        var d = stores[i].lastorderdate.split('T');
                        var date = d[0].split('-');
                        
                        var fullDate = getMonth(date[1])+" "+ date[2]+", "+date[0];
                        stores[i].lastorderdate = fullDate;
                    }
                }
                return stores;
            };
            var getMonth = function(month){
                switch(parseInt(month,10)){
                    case 01: 
                        return "January";
                    
                    case 02:
                        return "February";
                    
                    case 03:
                        return "March";
                    
                    case 04: 
                        return "April";
                        
                    case 05:
                        return  "May";
                        
                    case 06:
                        return "June";
                    
                    case 07:
                        return "July";
                    
                    case 08:
                        return "August";
                        
                    case 09: 
                        return "September";
                    
                    case 10: 
                        return "October";
                    
                    case 11:
                        return "November";
                        
                    case 12: 
                        return "December";
                }
            };
            function myobjsort(stores){
                var myarray = [];
                stores.sort(function(a,b){
                    var aName = newSort(a.storename);
                    var bName = newSort(b.storename);
                    return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
                });
                return stores;
            }
            function SortByName(a, b){
              var aName = a.name;
              var bName = b.name; 
              return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
            }
            function newSort(value) {
                var padding = '00000000000000000000';
                value = value.replace(/(\d+)((\.\d+)+)?/g, function ($0, integer, decimal, $3) {
                    if (decimal !== $3) {
                        // treat as a series of integers,
                        // rather than a decimal
                        return $0.replace(/(\d+)/g, function ($d) {
                            return padding.slice($d.length) + $d;
                        });
                    } else {
                        decimal = decimal || ".0";
                        return padding.slice(integer.length) + integer + decimal + padding.slice(decimal.length);
                    }
                });
                return value;
            }
            /*IE compatibility //v.r.s code*/
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      $(document).find('.dsdorderlabel').addClass('ie-fix');
    }
        
        });
    });

































