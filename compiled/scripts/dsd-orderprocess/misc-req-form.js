require([
    "modules/jquery-mozu", 
    "hyprlive",  
    "modules/backbone-mozu", 
    'modules/models-cart','modules/api',"dsd-orderprocess/review-cart","vendor/jquery-ui.min"
    ],function ($, Hypr, Backbone, CartModels,api,reviewcart) {
         var miscreqview = Backbone.MozuView.extend({
            templateName: "modules/dsd-orderprocess/misc-req-form", 
            additionalEvents: { 
                "click .add":'address',
                "click .crossmail": 'closemodel'
            },
            getRenderContext: function () {
                    var c = Backbone.MozuView.prototype.getRenderContext.apply(this, arguments);
                    //c.model.items[0].product.measurements.weight.value
                      console.log(reviewcart.storeadress.updatedAddress());   
                 
                    return c;
            },
            closemodel:function(){
                $(".model-mics-mail-h").hide();  
                $(".model-mail").hide(); 
                $("#cboxOverlay").hide();
            },
            address:function(){
               var address = reviewcart.storeadress;
             console.log(reviewcart.storeadress.updatedAddress());   
            },
            currentDay:function(){
                var date = new Date();
                var restDates= Hypr.getThemeSetting('blackoutdates');
                var blackoutdates;
                if(restDates!==""){
                    blackoutdates = restDates.split(',');
                }
                var day,month,year,currentDate,comparedate,businessdays=1;
                while(businessdays){
                    date.setFullYear(date.getFullYear(),date.getMonth(),(date.getDate()));
                    day = date.getDay();
                    month = date.getMonth(); 
                    year = date.getFullYear();
                    currentDate = date.getDate(); 
                    comparedate= ('0'+(month+1)).slice(-2)+ '/' + ('0'+currentDate).slice(-2) + '/' + year;
                    
                
                    if(day===0 || day===6){
                        date.setFullYear(year,month,(currentDate+1));
                    }else if(blackoutdates !== undefined  && blackoutdates.indexOf(comparedate) !== -1){
                        alert(blackoutdates !== undefined);
                         date.setFullYear(year,month,(currentDate+1));
                        
                    }else{
                        businessdays--;
                    }
                }
                date.setFullYear(year,month,(date.getDate()));
                var finalDate = ('0'+(date.getMonth()+1)).slice(-2)+ '-' + ('0'+date.getDate()).slice(-2) + '-' + date.getFullYear();
                return finalDate;   
            },
            render:function(){
                Backbone.MozuView.prototype.render.call(this);
                this.address();
                var finalDate = this.currentDay();
                finalDate = finalDate.replace(/-/g,'/');
             
                function weekEnds(date) {
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
                  
                    for (var j = 0; j < blackoutdates.length; j++) {
                        if ($.inArray( compareDate,blackoutdates) != -1 || (new Date() > date  && shipdate > date) ) {
                            if(shipdate.getDate() !==date.getDate())
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
          /*   function weekEnds(){
                 var day = date.getDay();
                    console.log();
                    return [(day > 0 && day < 6), '']; 
                            
             }*/
         
            
            $( "#datePicker" ).datepicker({
                minDate: '0',
                beforeShowDay: weekEnds
            });
        
            
         $( "#datePicker1" ).datepicker({ minDate: '0',
                beforeShowDay: weekEnds
             });
            
            $('#datePicker').datepicker('setDate',finalDate); 
            $('#datePicker1').datepicker('setDate',finalDate);
            $('.mz-misc-req-prod').show(); 
        }
         
    }); 
    
        
        $(document).ready(function(){
            var QOModel = Backbone.MozuModel.extend({});
            var storeAddress = "";
            var accountId= require.mozuData('user').accountId;
            api.request('GET','api/commerce/customer/accounts/'+accountId).then(function(resp){
                storeAddress =  resp.contacts[0];
                var miscreqView = new miscreqview({
                    el: $('.misc'),
                    model: new QOModel(storeAddress)
                });
                miscreqView.render();
            });         
            $('.quantity select').prop('disabled',true);
            
            $(".submit-form").prop('disabled', true);
            $("#misc-req").on("submit" , function(e){
                e.preventDefault();
                
            });
            
            // var currentUrl = window.location.href;
            // var data = currentUrl.split('?');
            // if(data.length >= 2){
            //     if(data[1] == "sucess"){
            //         alert("Done thanks");    
            //     }else if(data[1] == "Fail"){
            //         alert("Not Done ,Try again later");       
            //     }else{
            //         alert("not confident");
            //     }  
            // }
            $('.magic-checkbox').on('click',function(){
                getcounts();
                if($(this).prop('checked')){
                    $(this).parents('tr').find('.quantity').children('select').prop('disabled',false);
                }else{
                    $(this).parents('tr').find('.quantity').children('select').prop('disabled',true);    
                }
            });
            $('.qnt').on('change',function(){
                getcounts();
            });
            $('.crossmail').on('click',function(){
                    $(".model-mics-mail-h").hide(); 
                    $(".model-mail").hide();
                   $("#cboxOverlay").hide();
            });
            
            $(".submit-form").on("click",function(e){
                e.preventDefault();
                $(".model-mics-mail-h").show();
                var str = '';
                if($('#datePicker').val() !== "" || $('#datePicker1').val() !== ""){
                    $(".checkbox .checkboxcustom .magic-checkbox").each(function(k,v){
                        if($(this).is(":checked")){
                            str +=  "<tr><td style='padding-left: 17px;padding-top: 10px;padding-bottom: 10px;'>"+$(this).parents('tr').children('.item-td').children('p').html()+"</td><td style='padding-left: 10px;'>"+$(this).parents('tr').children('.item-name-td').children('p').html()+"</td><td style='padding-left: 10px;'>"+$(this).parents('tr').children('.quantity').children('.qnt').val()+"</td></tr>";
                        }    
                    });
                    
                    $(".tableData").attr('value',str);
                    var $form=$('#misc-req');
                    var action = $form.prop('action');
                    action += (action.indexOf('?') !== -1) ? "&" : "?";
                    $.post(action+"&callback=",$form.serialize(),function(){}).always(function(data){
                            if (data.responseText === "OK") {
                            $("#cboxOverlay").show();
                            $(".model-mail").show();
                            $('html, body').animate({
                                scrollTop: $('.model-mail').offset().top
                            }); 
                            $(".checkbox .checkboxcustom input").each(function(k,v){  
                                if($(this).is(":checked")){
                                    $(this).prop("checked",false);
                                }
                            });
							getcounts();
                            $(".submit-form").prop('disabled', true);
                      } else { 
                        $form.append('<span class="mz-validationmessage">Sorry, an error occurred. Please make sure all fields are filled out!</span>');
                      }
                    });
                }
                    
        });
        function getcounts(){
            var totalCount = 0;
                var totalweight = 0;
                $.each($('.list tr'),function(){
                    if($(this).find('.magic-checkbox').is(':checked')){
                        totalCount += parseInt($(this).find(".qnt").val(),10);
                        var mycount = parseInt($(this).find(".qnt").val(),10);
                        totalweight +=  (mycount*parseInt($(this).find(".qnt").attr('data-weight'),10));
                    }
                });
                $('.itemCount').find('span').html(totalCount);
                $('.itemweight').find('span').html(totalweight);
                $('.totelCount').attr('value',totalCount);
                $(".tableweight").attr('value',totalweight);
                if(totalCount > 0){
                    $(".submit-form").prop('disabled', false);
                }else{
                    $(".submit-form").prop('disabled', true);
                }
        }
        
 });


});











