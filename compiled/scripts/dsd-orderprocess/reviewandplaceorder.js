define([
    "modules/jquery-mozu", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'modules/cart-monitor',
    'modules/models-cart','modules/api',"vendor/iframexhr","modules/models-checkout","dsd-orderprocess/review-cart","vendor/jquery-ui.min"
    ],function ($, Hypr, Backbone, CartMonitor, CartModels,api,IFrameXmlHttpRequest,CheckoutModels,reviewcart) {

       var submitOrderView = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/reviewandplaceorder", 
            additionalEvents: {
                'keyup .ponumber' : 'poNumberSubmit',
                'blur input.ponumber'  : 'poNumberInput',
                'focus input.ponumber'  : 'poNumberInput'
            },
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
                    c.model.totalWeight=weight.toFixed(2);
                }
                
                return c;
            },
            datePicker:function(heat,fdate){
                var self = this;
                var date = new Date();
                var businessdays=2; 
                var restDates= Hypr.getThemeSetting('blackoutdates');
                var blackoutdates = restDates.split(',');
                var day,month,year,fulldate,currentDate,comparedate,finalShipDate;
                while(businessdays){
                    date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
                    day = date.getDay();
                    month = date.getMonth();
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                    fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1 || new Date() > comparedate){
                        date.setFullYear(year,month,currentDate);
                    }else{
                        businessdays--;
                    }
                }
                date.setFullYear(year,month,currentDate);
                if(fdate){
                    if(date>fdate){
                        finalShipDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                    }else{
                        var finalDate = self.finalShipDatePicker(fdate);
                        finalShipDate = ('0'+(finalDate.getMonth()+1)).slice(-2)+ '-' + ('0'+finalDate.getDate()).slice(-2) + '-' + finalDate.getFullYear();
                    }
                }else{
                    finalShipDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                }
                $('.estimateddate').text(finalShipDate);
                self.createCalendar(finalShipDate,heat); 
                
            },
            westDatePicker:function(){
                var date = new Date();
                var businessdays=2; 
                var restDates= Hypr.getThemeSetting('blackoutdates');
                var blackoutdates = restDates.split(',');
                var day,month,year,currentDate,comparedate;
                while(businessdays){
                    date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
                    day = date.getDay();
                    month = date.getMonth();
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                   // fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    
                    if(day===0 || day===6 || day===3 || day===4 || day===5 || day===2 ||blackoutdates.indexOf(comparedate) !== -1){
                        date.setFullYear(year,month,(currentDate));
                    }else{
                        businessdays--;
                    }
                }
                date.setFullYear(year,month,(currentDate));
                var finalShipDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                $('.estimateddate').text(finalShipDate);
               return finalShipDate;    
            },
            heatSensitvieDatePicker:function(heat,fdate){
                var date = new Date(),self = this,finalShipDate;
                var businessdays=2,bufferday=0; 
                var restDates= Hypr.getThemeSetting('blackoutdates');
                var blackoutdates = restDates.split(',');
                var day,month,year,currentDate,comparedate;
                while(businessdays){
                    day = date.getDay(); 
                    month = date.getMonth();
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                   // fulldate= ('0'+(month+1)).slice(-2)+ '-' + ('0'+currentDate).slice(-2) + '-' + year;
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(bufferday && (day===0 || day===6 || day===3 || day===4 || day===5 ||blackoutdates.indexOf(comparedate) !== -1) ){
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(!bufferday && (day===0 || day===6 ||blackoutdates.indexOf(comparedate) !== -1) ){
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(!bufferday && (day===2 || day===3 || day===4)){
                        var cdate = new Date(); 
                        cdate.setFullYear(year,month,(currentDate+1));
                        if(cdate.getDay()!==0 && cdate.getDay()!==6 && blackoutdates.indexOf(
                            ('0'+(cdate.getMonth()+1)).slice(-2)+ '/' + ('0'+cdate.getDate()).slice(-2) + '/' + cdate.getFullYear())===-1 ){
                            businessdays--;
                            bufferday=1;        
                        }
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(!bufferday && day===5){
                        var hdate = new Date();
                        hdate.setHours(11,51,0);
                        if(date<hdate){
                            businessdays--;
                            bufferday=1;
                            date.setFullYear(year,month,(currentDate+1));
                        }else if(date>hdate){
                            date.setFullYear(year,month,(currentDate+1));
                        }
                    }else if(!bufferday && day===1){
                        var mdate = new Date();
                        mdate.setHours(11,51,0);
                        if(date<mdate){
                            businessdays--;
                            bufferday=1;
                            date.setFullYear(year,month,(currentDate+1));
                        }else if(date>mdate){
                            date.setFullYear(year,month,(currentDate+1));
                        }
                    }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) !== -1){
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(bufferday && (day===1 || day===2) && blackoutdates.indexOf(comparedate) === -1){
                        businessdays--;
                    } 
                    else{
                        businessdays--;
                        date.setFullYear(year,month,(currentDate+1));
                        bufferday=1;
                    }
                }
                if(fdate){
                    if(date>fdate){
                        finalShipDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                    }else{
                        var finalDate = self.finalShipHeatDatePicker(fdate);
                        finalShipDate = ('0'+(finalDate.getMonth()+1)).slice(-2)+ '-' + ('0'+finalDate.getDate()).slice(-2) + '-' + finalDate.getFullYear();
                    }    
                }else{
                    finalShipDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                }
                $('.estimateddate').text(finalShipDate);
                self.createCalendar(finalShipDate,heat);   
               
            },
            finalShipHeatDatePicker:function(finalShipDate){
                var self = this,date = new Date(finalShipDate),businessdays=1,
                    restDates= Hypr.getThemeSetting('blackoutdates'),
                    blackoutdates = restDates.split(','),
                    day,month,year,fulldate,currentDate,comparedate;
                while(businessdays){
                    date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                    day = date.getDay();
                    month = date.getMonth();
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(day===0 || day===6 ||  day===3 ||  day===4 || day===5 || blackoutdates.indexOf(comparedate) !== -1){
                        date.setFullYear(year,month,(currentDate+1));
                    }else{
                        businessdays--;
                    }
                }
                return date;
            },
            finalShipDatePicker:function(finalShipDate){
                var self = this,date = new Date(finalShipDate),businessdays=1,
                    restDates= Hypr.getThemeSetting('blackoutdates'),
                    blackoutdates = restDates.split(','),
                    day,month,year,fulldate,currentDate,comparedate;
                    date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()+1));
                while(businessdays){
                    date.setFullYear(date.getFullYear(),date.getMonth(),date.getDate());
                    day = date.getDay();
                    month = date.getMonth();
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    if(day===0 || day===6 || blackoutdates.indexOf(comparedate) !== -1){
                        date.setFullYear(year,month,(currentDate+1));
                    }else{
                        businessdays--;
                    }
                }
                console.log(" final date ",date);
                return date;
            },
            getFutureDate:function(heat){
                var self = this;
                if((this.model.get('items').models.length>0 && this.model.get('items').models.length !== window.orderItems) || window.futureDate===""){
                    self.getProductDates(this.model);
                }else if(window.futureDate!==""){
                    if(heat){
						self.heatSensitvieDatePicker(heat,window.futureDate);
					}else{
						self.datePicker(heat,window.futureDate);
					}	
                }    
            },
            callback:function(res){
                var self = this,sdate,udate,heat=false;
                if(self.isHeatSensitive() &&  Hypr.getThemeSetting('heatSensitive')){
                    heat=true;
                }
                window.cartItems = self.model.get('items').length;
                udate = new Date(res);
                sdate = new Date((udate.getUTCMonth()+1)+'/'+udate.getUTCDate()+'/'+udate.getUTCFullYear());    
                window.orderItems = self.model.get('items').models.length;
                window.futureDate = sdate;
                if(heat){
                    self.heatSensitvieDatePicker(heat,sdate);
                }else{
                    self.datePicker(heat,sdate);
                }   
            },
            isHeatSensitive:function(){
                /*var items = this.model.get('items').models;
                var itemsLength = items.length;
                var i=0;
                for(i;i<itemsLength;i++ ){
                    if(items[i].get('product.properties').length>0){
                        var j = 0;
                        var proLength =items[i].get('product.properties').length;
                        for(j;j<proLength;j++){
                            if(items[i].get('product.properties')[j].attributeFQN==="tenant~isheatsensitive" || items[i].get('product.properties')[j].attributeFQN==="tenant~IsHeatSensitive" ){
                                if(items[i].get('product.properties')[j].values[0].value){
                                    return true;
                                }
                            }
                        }
                    }
                }    
                return false;*/
                return window.carthasHeatsensitiveItem;
            },
            createCalendar:function(finalShipDate,heat){
                    // Date Picker 
                var finalDate = finalShipDate.replace(/-/g,'/');    
                $('.datePicker').datepicker({
                    beforeShowDay: heatSensitive,
                    minDate:'0',
                    maxDate: '+12m',
                    dateFormat: "mm-dd-yy",	
                    onSelect: function(dateText, inst) { 
                        var date = $(this).datepicker('getDate'),
                        day  = date.getDate(),  
                        month = date.getMonth() + 1,              
                        year =  date.getFullYear();
                        var shipdate= ('0'+month).slice(-2)+ '-' + ('0'+day).slice(-2) + '-' + year;
                        //$('.estimateddate').text(shipdate);   
                    }
                });
                
                $('.datePicker').datepicker("setDate",finalShipDate);
                
                function heatSensitive(date) {
                    var restDates= Hypr.getThemeSetting('blackoutdates');
                    var blackoutdates = restDates.split(',');
                    var day;
                    var m = date.getMonth();
                    var d = date.getDate();
                    var y = date.getFullYear();
                
                    var dd = new Date();
                    var mm=dd.getMonth();
                    var ddd=dd.getDate();
                    var yy=dd.getFullYear();
                    
                    var shipdate =new Date(finalDate);
                    var currentDate=  ('0'+(mm+1)).slice(-2)+"/"+('0'+ddd).slice(-2)+"/"+ yy;
                    var compareDate = ('0'+(m+1)).slice(-2) + '/' +('0'+d).slice(-2) + '/' + y;
                    if(heat){
                        for (var i = 0; i < blackoutdates.length; i++) {
                        if ($.inArray( compareDate, blackoutdates) != -1 || new Date() > date  || shipdate > date ) {
                                return [false];
                            }
                        }
                        day = date.getDay();
                        if (day === 3 || day === 4 || day === 5 || day === 6 || day === 0 ) {
                            return [false] ; 
                        }else { 
                            return [true] ;
                        }
                    }else{
                        for (var j = 0; j < blackoutdates.length; j++) {
                            if ($.inArray( compareDate,blackoutdates) != -1 || new Date() > date || shipdate > date  ) {
                                return [false];
                            }
                        }
                        day = date.getDay();
                        if (day === 6 || day === 0 ) {
                            return [false] ; 
                        } else { 
                            return [true] ;
                        }
                    }     
                }
            },
            poNumberSubmit:function(e){
                var curStoreName = require.mozuData('user').firstName.toLowerCase();
                if((e.charCode>32 && e.charCode<45) || (e.charCode>57 && e.charCode<65) || (e.charCode>90 && e.charCode<97 && e.charCode!==95) || (e.charCode>122 && e.charCode<126) || e.charCode ===46 || e.charCode===47 ||  e.charCode == 32){
                    return false;
                }
                if($(e.currentTarget).val().trim().length>2){
                    if ((curStoreName.indexOf('farm') > -1 && curStoreName.indexOf('fleet') > -1) && !(/M0\d{6,}/.test($(e.currentTarget).val().trim()))) {
                        $('.placeorder').prop('disabled',true);
                    } else {
                        $('.placeorder').prop('disabled',false);
                    }
                }else{
                    $('.placeorder').prop('disabled',true);
                }
            },
            poNumberInput: function(e) {
                var curStoreName = require.mozuData('user').firstName.toLowerCase();
                if($('.ponumber').is(":focus")) {
                    $('.ponumber').css('border', '1px solid #a7a7a7');
                }
                $('.ponumber').blur(function() {
                    if ((curStoreName.indexOf('farm') > -1 && curStoreName.indexOf('fleet') > -1) && !(/M0\d{6,}/.test($(e.currentTarget).val().trim()))) {
                        $('.ponumber').css('border', '3px solid red');
                        if (!$('.ponum-warn').length) {
                            var poNumWarn = document.createElement('P');
                            poNumWarn.innerHTML = "Farm & Fleet stores must use a PO#/MO# generated from the store's inventory control dept. It will begin with 'M0' and contain 6 digits - Example: M0123456";
                            poNumWarn.style.color = 'red';
                            poNumWarn.classList.add('ponum-warn');
                            $(poNumWarn).insertAfter($('.po-date'));
                        }
                        $('.placeorder').prop('disabled',true);
                    } else {
                        if ($('.ponum-warn').length) {
                            $('.ponum-warn').remove();
                        }
                        $('.placeorder').prop('disabled',false);
                    }
                });
            },
            getProductDates:function(res){
                var productCodes=[],itemsLen = res.get('items').length,j=0,self = this;
                var fetchData = [];
                    for(j;j<itemsLen;j++){
                        var code = res.get('items').models[j].get('product.productCode');
                        if(productCodes.length>0 && productCodes.indexOf(code)<0){
                            fetchData.push({"productCode": code,quantity:1 });
                            productCodes.push(code);
                        }else if(productCodes.length<1){
                            fetchData.push({"productCode": code,quantity:1 });
                            productCodes.push(code);
                        }
                    }
                //return new Promise(function(resolve,reject){
                    if(productCodes.length>0){
                        api.request("post","/sfo/get_dates",{data:productCodes,customerId:require.mozuData('user').accountId}).then(function(resp) {
                            window.finalHeatShipDate = resp.FirstShipDate;
                            self.checkHeatSensitive();
                            self.callback(resp.FirstShipDate);
                        },function(err){
                            self.callback(res,self);
                        });
                    }else{
                        self.callback(res,self);
                    }
                //});
            },
            render:function(){
                $(".placeorder").prop("disabled",true); 
                Backbone.MozuView.prototype.render.call(this);
                var finalShipDate,heat,finalDate;
                if(this.isHeatSensitive() &&  Hypr.getThemeSetting('heatSensitive')){
                    heat = true;
                    this.getFutureDate(heat);
                    //finalDate = finalShipDate.replace(/-/g,'/');
                    //heat = true;
                }else{
                    heat = false;
                    this.getFutureDate(heat);
                    //finalDate = finalShipDate.replace(/-/g,'/');
                    //heat = false;
                }
               // }
               
            
            },
            placeOrder:function(){
                $(".overlay-full-width").show();
                var me=this;
                // var url = window.location.href;
                // if(url.lastIndexOf('/') > 0){
                //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                // }    
                var currentCart = window.currentCart = "";
                api.request('get','/api/commerce/carts/current').then(function(res) {
            
                    if(res.id){
                        window.currentCart = res;
                            api.request('POST', '/api/commerce/orders?cartid='+res.id).then(
                                function(res){
                                    var checkoutdata = res;
                                    checkoutdata.ipAddress = require.mozuData('pagecontext').ipAddress;
                                    var checkoutModel = window.order = new CheckoutModels.CheckoutPage(checkoutdata);
                                    $.cookie("orderid", checkoutdata.id);
                                    $.cookie("updateDate", checkoutdata.auditInfo.updateDate);
                                    $.cookie("createDate", checkoutdata.auditInfo.createDate);
                                    $.cookie("updateBy", checkoutdata.auditInfo.updateBy);
                                    $.cookie("createBy", checkoutdata.auditInfo.createBy);
                                    me.UpdateShipAddr();
                                },
                                function(err){
                                    var message;
                                    if(err.message.toLowerCase().indexOf('userexpired')>-1 ||err.message.toLowerCase().indexOf('appexpired')>-1 ){
                                        message="Sorry, but your session has expired.  Please log out and log back in.  If this doesn’t fix the issue, use the <a href='"+window.location.href+'contact-us'+"'>Contact Us</a> form to send us an email.";
                                        $('.modal.placeorder .modal-message').html(message);
                                        $('.modal.placeorder').show();
                                        $(".overlay-full-width").hide();
                                    }else if(err.message.toLowerCase().indexOf('The following items have limited quantity or are out of stock'.toLowerCase())>-1){
                                        var cartItems = window.currentCart.items;
                                        var responseText = err.message,products = [];
                                        $.each(cartItems,function(){
                                            if(responseText.indexOf(this.product.productCode)>-1){
                                                if($(window).width()>1024){
                                                    $(document).find($(document).find('[cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));     
                                                }else{
                                                    $(document).find($(document).find('[mob-cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));
                                                }
                                                var p = {
                                                    productcode:this.product.productCode
                                                };
                                                products.push(p);
                                            }
                                        });
                                        if(products.length>0){
                                            if( $.cookie("oosProducts")){
                                                $.cookie("oosProducts",JSON.stringify(JSON.parse($.cookie("oosProducts")).concat(products)));
                                            }else{
                                                $.cookie("oosProducts",JSON.stringify(products));
                                            }
                                        }
                                        $(".overlay-full-width").hide(); 
                                        if($(window).width()<768){
                                            $('html,body').animate({ 
                                            scrollTop: $("#review-your-order").offset().top},
                                            'slow');
                                        }
                                   }else if(err.message.toLowerCase().indexOf('Request payment decline:'.toLowerCase()) && err.message.toLowerCase().indexOf('PO number not validate for this customer'.toLowerCase()) >-1) {
                                        message= "Validation Error: Requested payment was declined. PO Number not valid.";
                                        $('.modal.placeorder .modal-message').html(message);
                                        $('.modal.placeorder').show();
                                        $(".overlay-full-width").hide();
                                    } else{
                                        message= err.message;
                                        $('.modal.placeorder .modal-message').html(message);
                                        $('.modal.placeorder').show();
                                        $(".overlay-full-width").hide();
                                   }
                                    
                                });
                            // createorder = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                            // createorder.withCredentials = true;
                            // createorder.setRequestHeader("Accept", "application/json");
                            // createorder.setRequestHeader("Content-Type", "application/json");
                            // createorder.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                            // createorder.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                            // createorder.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                            // createorder.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                            // createorder.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                            // createorder.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                            // createorder.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                            // createorder.open('POST', url+'/api/commerce/orders/?cartid='+res.id, true);
                            // createorder.onreadystatechange=function() {
                            //     if (createorder.readyState==4 && createorder.status==201) { 
                            //         var checkoutdata = JSON.parse(createorder.responseText);
                            //         checkoutdata.ipAddress = require.mozuData('pagecontext').ipAddress;
                            //         var checkoutModel = window.order = new CheckoutModels.CheckoutPage(checkoutdata);
                            //         //console.log(checkoutModel.get('billingInfo'));
                            //         $.cookie("orderid", checkoutdata.id);
                            //         $.cookie("updateDate", checkoutdata.auditInfo.updateDate);
                            //         $.cookie("createDate", checkoutdata.auditInfo.createDate);
                            //         $.cookie("updateBy", checkoutdata.auditInfo.updateBy);
                            //         $.cookie("createBy", checkoutdata.auditInfo.createBy);
                            //         setTimeout(function() {
                            //             me.UpdateShipAddr();
                            //         },1000);
                            //     }
                            //     else if(createorder.readyState==4 && createorder.status==401){
                            //         //alert("ssss");
                            //         var message;
                            //         if(JSON.parse(createorder.responseText).message.toLowerCase().indexOf('userexpired')>-1 ||JSON.parse(createorder.responseText).message.toLowerCase().indexOf('appexpired')>-1 ){
                            //             message="Sorry, but your session has expired.  Please log out and log back in.  If this doesn’t fix the issue, use the <a href='"+window.location.href+'contact-us'+"'>Contact Us</a> form to send us an email.";
                            //       }else{
                            //             message= JSON.parse(createorder.responseText).message;
                            //         }
                            //         $('.modal.placeorder .modal-message').html(message);
                            //         $('.modal.placeorder').show();
                            //         $(".overlay-full-width").hide();
                            //     } 
                            //     else if(createorder.readyState==4 && createorder.status==409){
                            //         console.log(JSON.parse(createorder.responseText).message);
                            //         console.log(window.currentCart);
                            //         var cartItems = window.currentCart.items;
                            //         var responseText = JSON.parse(createorder.responseText).message,products = [];
                            //         $.each(cartItems,function(){
                            //             if(responseText.indexOf(this.product.productCode)>-1){
                            //                 if($(window).width()>1024){
                            //                     $(document).find($(document).find('[cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));     
                            //                 }else{
                            //                     $(document).find($(document).find('[mob-cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));
                            //                 }
                            //                 var p = {
                            //                     productcode:this.product.productCode
                            //                 };
                            //                 products.push(p);
                            //             }
                            //         });
                            //         if(products.length>0){
                            //             if( $.cookie("oosProducts")){
                            //                 $.cookie("oosProducts",JSON.stringify(JSON.parse($.cookie("oosProducts")).concat(products)));
                            //             }else{
                            //                 $.cookie("oosProducts",JSON.stringify(products));
                            //             }
                            //         }
                            //         $(".overlay-full-width").hide(); 
                            //         if($(window).width()<768){
                            //             $('html,body').animate({ 
                            //             scrollTop: $("#review-your-order").offset().top},
                            //             'slow');
                            //         }
                            //     }
                            // };
                            // createorder.send();
                    }
               });
            
        },
        UpdateShipAddr: function(){
                var me = this,val;
            var address = window.storeAddress;
            var phone ={};
            if(address.phoneNumbers){
                    phone.home = address.phoneNumbers.home;
                    phone.mobile = address.phoneNumbers.mobile;
            }else{
                phone = "";
            }
            if(!address.address.address2){
                address.address.address2 = "";
            }
            var firstName= address.firstName,
            lastNameOrSurname= address.lastNameOrSurname,
            phoneNumbers= phone,
            address1= address.address.address1,
            address2= address.address.address2,
            cityOrTown= address.address.cityOrTown,
            stateOrProvince= address.address.stateOrProvince,
            postalOrZipCode= address.address.postalOrZipCode,
            countryCode= "US",
            addressType= address.address.addressType,
            email = address.email,
            id= address.id,
            company = address.companyOrOrganization,
               // value = '{"firstName":"'+firstName+'","lastNameOrSurname":"'+lastNameOrSurname+'","phoneNumbers":{"home":"'+phoneNumbers+'"},"address":{"address1":"'+address1+'","address2":"'+address2+'","cityOrTown":"'+cityOrTown+'","stateOrProvince":"'+stateOrProvince+'","postalOrZipCode":"'+postalOrZipCode+'","countryCode":"'+countryCode+'","addressType":"'+addressType+'","isValidated":true,"candidateValidatedAddresses":null},"orderId":"'+$.cookie("orderid")+'"}';
                value = '{"id":"'+id+'","email":"'+email+'","firstName":"'+firstName+'","lastNameOrSurname":"'+lastNameOrSurname+'","companyOrOrganization":"'+company+'","phoneNumbers":{"home":"'+phone.home+'","mobile":"'+phone.home+'"},"address":{"address1":"'+address1+'","address2":"'+address2+'","cityOrTown":"'+cityOrTown+'","stateOrProvince":"'+stateOrProvince+'","postalOrZipCode":"'+postalOrZipCode+'","countryCode":"'+countryCode+'","addressType":"'+addressType+'","isValidated":true,"candidateValidatedAddresses":null},"orderId":"'+$.cookie("orderid")+'"}';
            //localStorage.setItem('fullfiladdr', value);
            //$.cookie('fullfiladdr',value);
            window.value = value;
            val='{"fulfillmentInfo":{"fulfillmentContact":'+value+'}}';
                // var url = window.location.href;
                // if(url.lastIndexOf('/') > 0){
                //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                // }    
                if(val)
                {
                    api.request('PUT','api/commerce/orders/'+$.cookie("orderid"),val).then(function(res){
                        me.UpdateShipMeth();
                    },function(err){
                       console.log(err); 
                    });
                    
                    // Getoder = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                    // Getoder.withCredentials = true;
                    // Getoder.setRequestHeader("Accept", "application/json");
                    // Getoder.setRequestHeader("Content-Type", "application/json");
                    // Getoder.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                    // Getoder.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                    // Getoder.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                    // Getoder.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                    // Getoder.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                    // Getoder.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                    // Getoder.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                    // Getoder.open('PUT', url+'/api/commerce/orders/'+$.cookie("orderid"), true);
                    // Getoder.onreadystatechange=function() {
                    //     if (Getoder.readyState==4 && Getoder.status==200) {
                    //         setTimeout(function(){
                    //             me.UpdateShipMeth();}, 2000);
                    //     }
                    // };
                    // Getoder.send(val);
            }
            
        },
        UpdateShipMeth:function(){
            var me =this;
                api.request('GET','api/commerce/orders/'+$.cookie("orderid")+'/shipments/methods').then(function(res){
                    var audit='{"updateDate": "'+$.cookie("updateDate")+'", "createDate": "'+$.cookie("createDate")+'", "updateBy": "'+$.cookie("updateBy")+'", "createBy": "'+$.cookie("createBy")+'"}';
                    var local = window.value;
                    me.shippingMethods(res);
                },function(err){
                    console.log(err);
                });
                // var url = window.location.href;
                // if(url.lastIndexOf('/') > 0){
                //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                // }    
                //   var Getoder = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                //     Getoder.withCredentials = true;
                //     Getoder.setRequestHeader("Accept", "application/json");
                //     Getoder.setRequestHeader("Content-Type", "application/json");
                //     Getoder.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                //     Getoder.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                //     Getoder.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                //     Getoder.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                //     Getoder.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                //     Getoder.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                //     Getoder.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                //     Getoder.open('GET', url+'/api/commerce/orders/'+$.cookie("orderid")+'/shipments/methods', true);
                //     Getoder.send();
                    // Getoder.onreadystatechange=function() {
                    //     if (Getoder.readyState==4 && Getoder.status==200) {
                    //         var audit='{"updateDate": "'+$.cookie("updateDate")+'", "createDate": "'+$.cookie("createDate")+'", "updateBy": "'+$.cookie("updateBy")+'", "createBy": "'+$.cookie("createBy")+'"}';
                    //         //var local=localStorage.getItem('fullfiladdr');
                    //         //var local=$.cookie('fullfiladdr');
                    //         var local = window.value;
                    //         if(Getoder.responseText){
                    //         var upsGround = JSON.parse(Getoder.responseText);
    
                    //       setTimeout(function(){
                    //          me.shippingMethods(upsGround);//  me.updateShippingMethod(val_shipmethd,local,audit);
                    //           },2000);
                    //     }
                    //     }
                    // };
            
        }, 
        shippingMethods:function(upsGround){
            
            var me =this;
            var local = window.value;
            var audit='{"updateDate": "'+$.cookie("updateDate")+'", "createDate": "'+$.cookie("createDate")+'", "updateBy": "'+$.cookie("updateBy")+'", "createBy": "'+$.cookie("createBy")+'"}';
                       
                var val_shipmethd = '{"fulfillmentInfo":{"fulfillmentContact":'+local+',"isDestinationCommercial":false,"auditInfo":'+audit+',"availableShippingMethods":[{"shippingMethodCode":"'+upsGround[0].shippingMethodCode+'","shippingMethodName":"'+upsGround[0].shippingMethodName+'","shippingZoneCode":"'+upsGround[0].shippingZoneCode+'","isValid":true,"messages":[],"currencyCode":"USD","price":"'+upsGround[0].price+'"}],"shippingMethodCode":"'+upsGround[0].shippingMethodCode+'","shippingMethodName":"'+upsGround[0].shippingMethodName+'","shippingZoneCode":"'+upsGround[0].shippingZoneCode+'","isValid":true,"messages":[],"currencyCode":"USD","price":"'+upsGround[0].price+'"}}';
             me.updateShippingMethod(val_shipmethd,local,audit);
            //   setTimeout(function(){
            //              me.updateShippingMethod(val_shipmethd,local,audit);//  me.updateShippingMethod(val_shipmethd,local,audit);
            //               },1000);
                             
        },
        updateShippingMethod:function(val_shipmethd,local,audit){
                var me=this;
                // var url = window.location.href;
                // if(url.lastIndexOf('/') > 0){
                //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                // }    
                if(val_shipmethd && local && audit){
                    api.request('PUT','api/commerce/orders/'+$.cookie("orderid"),val_shipmethd).then(function(res){
                        me.UpdatePayment();
                    },function(err){
                        console.log(err);
                    });
                //     UpdateShippingMethod = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                //     UpdateShippingMethod.withCredentials = true;
                //     UpdateShippingMethod.setRequestHeader("Accept", "application/json");
                //     UpdateShippingMethod.setRequestHeader("Content-Type", "application/json");
                //     UpdateShippingMethod.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                //     UpdateShippingMethod.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                //     UpdateShippingMethod.open('PUT', url+'/api/commerce/orders/'+$.cookie("orderid"), true);
                //     UpdateShippingMethod.onreadystatechange=function() {
                //       if (UpdateShippingMethod.readyState==4 && UpdateShippingMethod.status==200) {
                //           setTimeout(function() {
                //               me.UpdatePayment(); }, 1000);
                //      }
                //   };
                //     UpdateShippingMethod.send(val_shipmethd); 
                 
            }  
            
        },
        UpdatePayment:function(){
            var me = this;
            var a= window.order.get('billingInfo').get('purchaseOrder');
            var ponumber = $('.ponumber').val();
            var shippingDate = $('.datePicker') .val();
            var phone;
            var address = window.storeAddress;
            if(address.phoneNumbers){
                if(address.phoneNumbers.home){
                    phone = address.phoneNumbers.home;
                }else if(address.phoneNumbers.mobile){
                    phone = address.phoneNumbers.mobile;
                    }else{
                        phone = "";
                    }
                }else{
                    phone = "";
                }
               //var userData = JSON.parse($.cookie("userData"));  
                var proxyEmail = address.email, 
                    bfirstName= address.firstName,
                blastNameOrSurname= address.lastNameOrSurname,
                bphoneNumbers= phone,
                baddress1= address.address.address1,
                baddress2= address.address.address2,
                bcityOrTown=  address.address.cityOrTown,
                bstateOrProvince= address.address.stateOrProvince,
                bpostalOrZipCode=  address.address.postalOrZipCode,
                bcountryCode= "US",
                baddressType=  address.address.addressType,
                bemail = proxyEmail,
                nameOnCheck = address.firstName,
                //auditInfo = localStorage.getItem('auditInfo');
               // auditInfo = $.cookie('auditInfo');
                payinfo = '{"email":"'+bemail+'","firstName":"'+bfirstName+'","lastNameOrSurname":"'+blastNameOrSurname+'","phoneNumbers":{"home":"'+bphoneNumbers+'"},"address":{"address1":"'+baddress1+'","cityOrTown":"'+bcityOrTown+'","stateOrProvince":"'+bstateOrProvince+'","postalOrZipCode":"'+bpostalOrZipCode+'","countryCode":"'+bcountryCode+'","addressType":"'+baddressType+'","isValidated":true,"candidateValidatedAddresses":null}}',
                
                //vals='{"currencyCode":"USD","amount":"'+a.get('amount')+'","newBillingInfo":{"paymentType":"PurchaseOrder","billingContact":'+payinfo+',"isSameBillingShippingAddress":false,"purchaseOrder":{"purchaseOrderNumber":"'+ponumber+'","paymentTerm":{"code":"terms-on-file","description":"Terms On File"},"customFields":[{"code":"shipdate","label":"ShipDate","value":"'+shippingDate+'"}],"isEnabled":true,"splitPayment":false,"amount":"'+a.get('amount')+'","paymentTermOptions":[{"code":"jb-30-days","description":"Jb 30 Days","siteId":"'+window.order.get('siteId')+'"}],"pOCustomField-dates":"'+shippingDate+'"}}}';
                vals='{"currencyCode":"USD","amount":"'+a.get('amount')+'","newBillingInfo":{"paymentType":"PurchaseOrder","billingContact":'+payinfo+',"isSameBillingShippingAddress":true,"purchaseOrder":{"purchaseOrderNumber":"'+ponumber+'","paymentTerm":{"code":"terms-on-file","description":"Terms On File"},"customFields":[{"code":"shipdate","label":"ShipDate","value":"'+shippingDate+'"}],"isEnabled":true,"splitPayment":false,"amount":"'+a.get('amount')+'","paymentTermOptions":[{"code":"terms-on-file","description":"Terms On File","siteId":"'+window.order.get('siteId')+'"}],"pOCustomField-dates":"'+shippingDate+'"}}}';
                    api.request('POST','api/commerce/orders/'+$.cookie("orderid")+'/payments/actions',vals).then(function(resp){
                        resp.agreeToTerms="true";
                        resp.customer={"contacts":[],"cards":[],"credits":[],"purchaseOrder":[]};
                        var res  =   window.res = resp;
                        me.order();
                    },function(err){
                        console.log(err);
                    });
                    
                    
                    
                    // var url = window.location.href;
                    // if(url.lastIndexOf('/') > 0){
                    //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                    // }    
                    // var Getoders = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                    // Getoders.withCredentials = true;
                    // Getoders.setRequestHeader("Accept", "application/json");
                    // Getoders.setRequestHeader("Content-Type", "application/json");
                    // Getoders.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                    // Getoders.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']); 
                    // Getoders.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                    // Getoders.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                    // Getoders.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                    // Getoders.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                    // Getoders.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                    // Getoders.open('POST',url+'/api/commerce/orders/'+$.cookie("orderid")+'/payments/actions', true);
                    // Getoders.onreadystatechange=function() {
                    //     if (Getoders.readyState==4 && Getoders.status==200) {
                    //       // console.log(Getoders.responseText);
                    //         var resp = JSON.parse(Getoders.responseText);
                    //         resp.agreeToTerms="true";
                    //         resp.customer={"contacts":[],"cards":[],"credits":[],"purchaseOrder":[]};
                    //         //localStorage.setItem('paymentres', JSON.stringify(resp));
                    //         var res  =   window.res = JSON.stringify(resp);
                    //         //$.cookie('paymentres', JSON.stringify(resp));
                    //       setTimeout(function(){
                    //          me.order();
                    //       },1000);
                    //     }
                    // };     
                    // Getoders.send(vals);
            
        },
        order:function(){
            $('[data-mz-action="order"]').addClass('is-loading');
            
            var me = this;
                // var url = window.location.href;
                // if(url.lastIndexOf('/') > 0){
                //     url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
                // }    
                
                //val=localStorage.getItem('paymentres');
                //val=$.cookie('paymentres');
                var val = window.res;
                api.request('PUT','api/commerce/orders/'+$.cookie("orderid"),val).then(function(res){
                    me.order1();
                },function(err){
                    console.log(err);
                });
                // var Getoders = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                // Getoders.withCredentials = true;
                // Getoders.setRequestHeader("Accept", "application/json");
                // Getoders.setRequestHeader("Content-Type", "application/json");
                // Getoders.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                // Getoders.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                // Getoders.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                // Getoders.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                // Getoders.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                // Getoders.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                // Getoders.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                // Getoders.open('PUT', url+'/api/commerce/orders/'+$.cookie("orderid"), true);
                // Getoders.onreadystatechange=function() {
                //     if (Getoders.readyState==4 && Getoders.status==200) {
                //       // console.log(Getoders.responseText);
                //         setTimeout(function()
                //         {me.order1();
                //         } , 1000);
                //     }
                // };
                // Getoders.send(val);
        
        },
        order1:function(){
            var url = window.location.href;
            if(url.lastIndexOf('/') > 0){
                url = window.location.href.substr(0,window.location.href.lastIndexOf('/'));
            }    
                var vals='{ "actionName":"SubmitOrder"}';
                api.request('POST','api/commerce/orders/'+$.cookie("orderid")+'/actions',vals).then(function(res){
                    window.order.apiModel.update({ipAddress:window.order.get('ipAddress')});
                    var userEmail;
                    if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
                      userEmail = JSON.parse(decodeURIComponent($.cookie('userData'))).email;
                    } 
                    api.request('get','/svc/userCapture/'+window.order.get('orderNumber')+'/'+userEmail+'/'+require.mozuData('pagecontext').ipAddress  ).then(function(resp){
                       window.location =url+"/checkout/"+ res.id +"/confirmation";
                    },function(err){
                        console.log(err);
                        window.location =url+"/checkout/"+ res.id +"/confirmation";
                    });
                    
                },function(err){
                    console.log(err);
                    var cartItems = window.currentCart.items;
                    var responseText = err.message,products = [];
                    if(responseText.indexOf('not have enough stock')>-1){
                        $.each(cartItems,function(){
                            if(responseText.indexOf(this.product.productCode)>-1){
                                if($(window).width()>1024){
                                    $(document).find($(document).find('[cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));     
                                }else{
                                    $(document).find($(document).find('[mob-cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));
                                }
                                var p = {
                                    productcode:this.product.productCode
                                };
                                products.push(p);
                            }
                        });
                        if(products.length>0){
                            if( $.cookie("oosProducts")){
                                $.cookie("oosProducts",JSON.stringify(JSON.parse($.cookie("oosProducts")).concat(products)));
                            }else{
                                $.cookie("oosProducts",JSON.stringify(products));
                            }
                        }
                        $(".overlay-full-width").hide(); 
                    }else{
                            if(err.message.toLowerCase().indexOf('Request payment decline:'.toLowerCase()) && err.message.toLowerCase().indexOf('PO number not validate for this customer'.toLowerCase()) >-1) {
                                message= "Validation Error: Requested payment was declined. PO Number not valid.";
                                $('.modal.placeorder .modal-message').html(message);
                                $('.modal.placeorder').show();
                                $(".overlay-full-width").hide();
                            }else if(err.message !== ""){
                            var message = "";
                            if(err.message.toLowerCase().indexOf('userexpired')>-1 ||err.message.toLowerCase().indexOf('appexpired')>-1 ){
                                message="Sorry, but your session has expired.  Please log out and log back in.  If this doesn’t fix the issue, use the <a href='"+window.location.href+'contact-us'+"'>Contact Us</a> form to send us an email.";
                            }else{
                                message= err.message;
                            }
                            $('.modal.placeorder .modal-message').html(message);
                            $('.modal.placeorder').show();
                            $(".overlay-full-width").hide();
                        }
                    }
                });
                // var Getoder = new IFrameXmlHttpRequest(url+"/resources/receiver.html");
                // Getoder.withCredentials = true;
                // Getoder.setRequestHeader("Accept", "application/json");
                // Getoder.setRequestHeader("Content-Type", "application/json");
                // Getoder.setRequestHeader("x-vol-app-claims", require.mozuData('apicontext').headers['x-vol-app-claims']);
                // Getoder.setRequestHeader("x-vol-currency", require.mozuData('apicontext').headers['x-vol-currency']);
                // Getoder.setRequestHeader("x-vol-locale", require.mozuData('apicontext').headers['x-vol-locale']);
                // Getoder.setRequestHeader("x-vol-master-catalog", require.mozuData('apicontext').headers['x-vol-master-catalog']);
                // Getoder.setRequestHeader("x-vol-site", require.mozuData('apicontext').headers['x-vol-site']);
                // Getoder.setRequestHeader("x-vol-tenant", require.mozuData('apicontext').headers['x-vol-tenant']);
                // Getoder.setRequestHeader("x-vol-user-claims", require.mozuData('apicontext').headers['x-vol-user-claims']);
                // //console.log('https://t12312-s17329.sandbox.mozu.com/api/commerce/orders/'+$.cookie("orderid")+'/actions');
                // Getoder.open('POST', url+'/api/commerce/orders/'+$.cookie("orderid")+'/actions', true);
                // Getoder.onreadystatechange=function() {
                //     if (Getoder.readyState==4 && Getoder.status==200) {
                //          $(".overlay-full-width").hide();
                //          var ss = JSON.parse(Getoder.responseText);
                //          // console.log(url+"/checkout/"+ ss.id +"/confirmation");
                //          window.order.apiModel.update({ipAddress:window.order.get('ipAddress')});
                       
                //         /*var userData = {
                //           email: userEmail,
                //           orderNumber:window.order.get('orderNumber'),
                //           ipAddress:require.mozuData('pagecontext').ipAddress
                //         } ;*/
                //         /*$.ajax({
                //             method:'POST',
                //             url:'/svc/userCapture',
                //             data: JSON.stringify(userData), 
                //             dataType: 'json',
                //             contentType: 'application/json',  
                //             success:function(res){
                //                 window.location =url+"/checkout/"+ ss.id +"/confirmation";
                //             },
                //             error:function(err){
                //                 window.location =url+"/checkout/"+ ss.id +"/confirmation";
                //             }
                //         });*/
                //         window.location =url+"/checkout/"+ ss.id +"/confirmation";
                //     }else if(Getoder.readyState==4 && Getoder.status==409){
                //         var cartItems = window.currentCart.items;
                //         var responseText = JSON.parse(Getoder.responseText).message,products = [];
                //         if(responseText.indexOf('not have enough stock')>-1){
                //             $.each(cartItems,function(){
                //                 if(responseText.indexOf(this.product.productCode)>-1){
                //                     if($(window).width()>1024){
                //                         $(document).find($(document).find('[cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));     
                //                     }else{
                //                         $(document).find($(document).find('[mob-cart-prod-code="'+this.product.productCode+'"]')).text(Hypr.getLabel('qtynotavailabel'));
                //                     }
                //                     var p = {
                //                         productcode:this.product.productCode
                //                     };
                //                     products.push(p);
                //                 }
                //             });
                //             if(products.length>0){
                //                 if( $.cookie("oosProducts")){
                //                     $.cookie("oosProducts",JSON.stringify(JSON.parse($.cookie("oosProducts")).concat(products)));
                //                 }else{
                //                     $.cookie("oosProducts",JSON.stringify(products));
                //                 }
                //             }
                //             $(".overlay-full-width").hide(); 
                //         }else{
                //         if(JSON.parse(Getoder.responseText).message !== ""){
                //             var message = "";
                //           if(JSON.parse(Getoder.responseText).message.toLowerCase().indexOf('userexpired')>-1 ||JSON.parse(Getoder.responseText).message.toLowerCase().indexOf('appexpired')>-1 ){
                //                         message="Sorry, but your session has expired.  Please log out and log back in.  If this doesn’t fix the issue, use the <a href='"+window.location.href+'contact-us'+"'>Contact Us</a> form to send us an email.";
                //             }else{
                //                 message= JSON.parse(Getoder.responseText).message;
                //             }
                //             $('.modal.placeorder .modal-message').html(message);
                //             $('.modal.placeorder').show();
                //             $(".overlay-full-width").hide();
                //         }
                //         }
                //     }
                // };
                // var userEmail;
                // if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
                //   userEmail = JSON.parse(decodeURIComponent($.cookie('userData'))).email;
                // } 
                // api.request('get','/svc/userCapture/'+window.order.get('orderNumber')+'/'+userEmail+'/'+require.mozuData('pagecontext').ipAddress  ).then(function(resp){
                //     console.log(resp); 
                //     Getoder.send(vals);
                // });
                // api.on('error',function(e){ 
                //     console.log('error'); 
                //     Getoder.send(vals); 
                // });  
        },
        updateOrder:function(){
            /*this.model.apiGet().then(function(){
                this.checkHeatSensitive();
            });*/
            this.model.apiGet();
            this.checkHeatSensitive();
           // this.render();
         
        },
        checkHeatSensitive:function(){
            var _this = this;
            var items = [];
                $.each(_this.model.get('items').models,function(i,v){
                    var obj = {
                        productcode:v.get('product.productCode'),
                        quantity:v.get('quantity')
                    };
                    items.push(obj);
                });
                console.log("window.finalHeatShipDate---",window.finalHeatShipDate);
                if(window.finalHeatShipDate){
                    var reqBody = {customerId:require.mozuData('user').lastName,
                                    items:items,
                                    shipDate:window.finalHeatShipDate};
                                    window.carthasHeatsensitiveItem = false;
                    api.request('POST','svc/verifyHeatsensitiveProducts',reqBody).then(function(resp){
                        $.each(_this.model.get('items').models,function(i,v){
                                for(var k=0;k<resp.length;k++){
                                    if(v.get('product.productCode') === resp[k].productCode){
                                        v.set("isHeatsensitive",resp[k].isHeatSensitive);
                                        _this.model.get('items').models[k].set("isHeatsensitive",resp[k].isHeatSensitive);
                                        if(resp[k].isHeatSensitive){
                                            window.carthasHeatsensitiveItem = true;
                                        }
                                    }
                                }
                        });
                        setTimeout(function(){
                            console.log("render");
                            _this.render();
                        // window.cart && window.cart.render();
                            console.log("_this.model.get('items').models ---",_this.model.get('items').models);
                        },2000);
                    });
                }    
        },
    });
    var cartModel = new CartModels.Cart();
    var submitOrder = new submitOrderView({
        el: $('.place-order'),
        model: cartModel
    });
    submitOrder.render();
    window.submitOrder = submitOrder;
    var storeAddress = "";
    var accountId= require.mozuData('user').accountId;
    api.request('GET','api/commerce/customer/accounts/'+accountId).then(function(resp){
        storeAddress =  resp.contacts[0];
        window.storeAddress = storeAddress;
    });
    $(document).ready(function(){
        var orderItems = window.orderItems = 0;
        var futureDate = window.futureDate = "";

        $(document).on('click','.checkout-button',function(){
            cartModel.apiGet();
            $('.order-body').slideUp();
            $('.place-order').slideDown(function(){
                $('html, body').animate({
                scrollTop: $('.dsdcheckoutheader').offset().top
            }, 1000);
            });

            var curStoreName = require.mozuData('user').firstName.toLowerCase();

            if (curStoreName.indexOf('farm') > -1 && curStoreName.indexOf('fleet') > -1) {
                setTimeout(function() {
                  document.querySelector('.po-number div').style.opacity = 0;
                }, 300);
            }

            $('.dsdheader .collapsed').hide(function(){
                 $('.dsdheader .editchange').show();
            });  
            $('.dsdcheckoutheader .editchange').hide(function(){
                $('.dsdcheckoutheader .collapsed').show();
            });
            if($(window).width()<=767){
            $(".review-order-container .checkout-button").fadeOut(function(){
                $(".review-order-container .mobile-order").fadeIn();
            });
            }else{
                $(".review-order-container .checkout-button").fadeOut(function(){
               $(".review-order-container .placeorder").fadeIn();
                });
               }
            });
             $(document).on('click','.modal.placeorder .btn-yes',function(){
                  $('.modal.placeorder').hide();
             });
        });
        return {
            submitOrder:submitOrder
        };
});





 
