require([
    "modules/jquery-mozu", "underscore","modules/api",
    "hyprlive", "modules/backbone-mozu"],function ($,_, api, Hypr, Backbone) {
         $(document).ready(function(event){
           var cosentino = ['24820228',
           '24820211',
           '24820219',
           '24820210',
           '24820218',
           '24820225',
           '24820215',
           '24820206',
           '24820204',
           '24820216',
           '24820212',
           '24820201',
           '24820214',
           '24820202',
           '24820205',
           '24820217',
           '24820220',
           '24820207',
           '24820208',
           '24820209',
           '24820229',
           '24820213',
           '24820221',
           '24820226',
           '24820223'];

           // example
           var em = document.getElementById('easter-announcement');
           var cv19 = document.getElementById('covid19');
           var ref = document.querySelector('.mz-breadcrumbs');
           if (location.href.indexOf('covid19') === -1) {
             try {
               var cosentinoSpecialMessage = document.getElementById('cosentino-special-message');
               if (cosentino.indexOf(require.mozuData('user').lastName) > -1) {
                insertAfter(cosentinoSpecialMessage, ref);
                cosentinoSpecialMessage.style.display = "block";
              }
            } catch (e) { console.log(e); }
             insertAfter(em, ref);
             insertAfter(cv19, ref);
           }

         function insertAfter(el, referenceNode) {
           referenceNode.parentNode.insertBefore(el, referenceNode.nextSibling);
         }

           // store account messaging
           api.request('GET', '/svc/storeaccount').then(function(res){
             if(res.account !== undefined){
             $.colorbox({
              open : true,
              maxWidth : "100%",
              maxHeight : "100%",
              scrolling : false,
              fadeOut : 500,
              html : "<div style='padding: 30px;text-align:center;background-color:#fff;'><p style='padding-bottom:10px;'>"+res.message+"</p><center><button id='close' style='order: none;color: white;padding: 7px 32px;text-align: center;text-decoration: none;display: inline-block;font-size: 16px;background-color:#008CBA;color:#fff;'>Okay, got it!</button></center>",
              overlayClose : false,
              onComplete : function () {
                   $("#close").on('click',function() {
                         $.colorbox.close();
                     });
                   $('#cboxLoadedContent').css({
                        background : "#ffffff"
                   });
                 }
                });
             }
               }, function(error) {
             console.log(error);
           });

           $(document).on('submit','#contact-form-container', function(e){
               var name = $('[data-mz-value="contactusName"]').val();
               var email = $('[data-mz-value="contactusEmail"]').val();
               // var group = $('[data-mz-value="contactusGroup"]').val();
               // var storeName = $('[data-mz-value="contactusStore"]').val();
               // var storeNum = $('[data-mz-value="contactusStore"]').val();
               // var city = $('[data-mz-value="contactusCity"]').val();
               // var state = $('[data-mz-value="contactusState"]').val();
               var message = $('.mz-checkoutform-comments-field').val();
               // if(name.length > 0 && email.length > 0 && group.length > 0 && storeName.length > 0 && storeNum.length > 0 && city.length > 0 && state.length > 0 && message.length > 0){
               //      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
               //      var patt = new RegExp(re);
               //       if(patt.test(email.trim())){
               //          return true;
               //       }else{
               //          return false;
               //       }
               // }else{
               //     return false;
               // }

               if(name.length > 0 && email.length > 0 && message.length > 0){
                    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                    var patt = new RegExp(re);
                     if(patt.test(email.trim())){
                        return true;
                     }else{
                        return false;
                     }
               }else{
                   return false;
               }
           });

 			$('.session-time').on('click','.continue-btn',function(){
                $(".session-time .modal-container").hide();
                window.location ="/logout";
                 });
             $('.timeout').on('click','.continue-btn',function(){
                $(".session-time .modal-container").hide();
                window.location ="/logout";
             });
             var idleIntervall,idleInterval,
			 anonymous = require.mozuData('user').isAnonymous,
             authUser = require.mozuData('user').isAuthenticated,idleTimeout,idleTime;
             if(Hypr.getThemeSetting('wwwSiteLink') == window.location.origin) {
                //Session Timeout
                /*var anonymous = require.mozuData('user').isAnonymous;
                var authUser = require.mozuData('user').isAuthenticated;*/
                idleTimeout = 2;
                idleTime = 0;
                idleInterval = setInterval(timerIncrement, 1000);
                var k = 0;
                if(authUser){
                    $(this).mousemove(function(e){

                        if(idleTime >= 300){
                            /*if($(".session-time").is(':hidden')){
                                $(".session-time").show();
                            }  */
                          /*setTimeout(function(){
                            if(k === 0){
                                //$(".session-time").hide();
                                //window.location="/logout?clearSession=yes";
                                k++;
                              }
                          },1000);
                          */
                          //});
                        }
                        else {
                        idleTime = 0;
                        }
                    });
                    $(this).click(function(e){
                      if(idleTime >= 300){
                          $(".session-time").show();
                            if($(".session-time").is(':hidden')){
                                $(".session-time").show();
                            }
                       setTimeout(function(){
                            if(k === 0){
                            $(".session-time").hide();
                            window.location="/logout?clearSession=yes";
                                k++;
                            }
                        },1000);

                      }
                      else{
                        idleTime = 0;
                      }
                    });
                    $(this).keypress(function(e){
                        if(idleTime >= 300){
                            $(".session-time").show();
                           /* if($(".session-time").is(':hidden')){
                                $(".session-time").show();
                            }*/
                            /*setTimeout(function(){
                                if(k === 0){
                                    //$(".session-time").hide();
                                    //window.location="/logout?clearSession=yes";
                                    k++;
                                }
                            },1000);
                            //});
                            */
                        }
                        else{
                          idleTime = 0;

                        }
                    });

                }
                $("body").on("click",function(){
                    $(".popmodelsession").hide();
                });

            }

            var a = Hypr.getThemeSetting('dsdeastwest').substr(0,Hypr.getThemeSetting('dsdeastwest').lastIndexOf('/'));
            if(window.location.origin.indexOf(a) !== -1) {
                //Session Timeout
                idleTimeout = 2;
                idleTime = 0;
                idleInterval = setInterval(timerIncrement, 1000);
                if(authUser){
                    $(this).mousemove(function(e){
                        if(idleTime >= 900){
                           /* if($(".timeout").is(':hidden')){
                                $(".timecounter").hide();
                                $(".timeout").show();
                            }*/

                           /* setTimeout(function(){
                                $(".timeout").hide();
                                  window.location="/logout";
                            },1000);*/
                          //});
                        }else{
                            if(!($(".timecounter").is(":visible"))){
                                idleTime = 0;
                            }
                        }
                    });
                    $(this).click(function(e){
                      if(idleTime >= 900){

                        /*if($(".timeout").is(':hidden') && !$(e.target).hasClass('comltlogout')){
                            $(".timecounter").hide();
                            $(".timeout").show();
                        }*/

                        /*setTimeout(function(){
                            $(".timeout").hide();
                           window.location="/logout";
                         $(".timeout").hide();
                     },200);*/

                      }
                      else{
                         if(!($(".timecounter").is(":visible"))){
                                idleTime = 0;
                            }
                      }
                    });
                    $(this).keypress(function(e){
                        if(idleTime >= 900){
                          /*  if($(".timeout").is(':hidden')){
                                $(".timecounter").hide();
                                $(".timeout").show();
                            }*/

                            /*setTimeout(function(){
                                $(".timeout").hide();
                              window.location="/logout";
                             },200);*/
                            //});
                        }
                        else{
                            if(!($(".timecounter").is(":visible"))){
                                idleTime = 0;
                            }
                        }
                    });

                }


            }
            $('.continue-btn').on('click',function(){
                idleTime = 0;
                $(".timecounter").hide();
            });
            function secToMin(secs){
                var min = parseInt(secs/60,10);
                var sec = secs - (min*60);
                if(sec <= 9){
                    sec = "0"+sec;
                }
                return min+":"+sec;
            }
            function timerIncrement(){
                if(authUser){
                    idleTime = idleTime + 1;
                    var a = Hypr.getThemeSetting('dsdeastwest').substr(0,Hypr.getThemeSetting('dsdeastwest').lastIndexOf('/'));
                    if(window.location.origin.indexOf(a) !== -1) {
                        if(idleTime >= 600 && idleTime <= 900){
                          $('.modal').hide();
                          $(".timecounter").show();
                          var time = secToMin((900-idleTime));
                          $(".timecounter").find('.time-counter').html(time);
                        }else if(idleTime >= 900){
                          $(".timecounter").hide();
                          $(".timeout").show();
                          clearInterval(idleInterval);
                        }
                    }else if(Hypr.getThemeSetting('wwwSiteLink') == window.location.origin){
                       if(idleTime >= 300){
                            $('.modal').hide();
                            $(".session-time").show();
                           clearInterval(idleIntervall);
                       }
                    }
                }
            }
            //Session Timeout


             //redirect from myaccount
            if(window.location.href.indexOf('myaccount')>-1){
                window.location.assign('/');
            }
             // show proxy login in east/west site.
             if($.cookie("userData") && $.cookie("userData") != "null"){
             //var userData = JSON.parse($.cookie("userData"));
                var proxyEmail = JSON.parse($.cookie('userData'));
                $("#mz-logged-in-notice a").html(proxyEmail.email);
                $("#mz-logged-in-notice a").show();
             }
          var auth = require.mozuData('user').isAuthenticated;
          if( require.mozuData('user').isAnonymous && !auth && window.location.pathname.indexOf("/user/login") === -1 ){
              // console.log(require.mozuData('user').isAnonymous+" "+!auth );
                       }

          //Remove target="_blank" from the logo.
          $('.logo-jb a[target="_blank"]').removeAttr('target');
          //For downloads in header/footer to open in anew window.
          $(".mz-column.mz-column-1 ul.jb-column-mainlist li:first-child a").attr("target","_blank");
          $(".mz-sitenav-list li:nth-child(2) a").attr("target","_blank");
         // $(".mz-sitenav-list li a").attr("target","_blank");

              $( "#contact-form-container" ).submit(function( event ) {
                  var $form = $(this);
                  var errorCount = 0;
                  $('input[type=text], input[type=email],input[type=tel], textarea').each(function(index){
                      if($(this).attr('req')){
                         if($(this).val() === "" || $(this).val() === " "  || $(this).val() === null || $(this).val() === undefined){
                              if($(this).attr('error')){
                                    $(this).after("<div class='error-msg'>"+$(this).attr('error')+"<div>");
                                    errorCount++;
                              }else{
                                  $(this).after("<div class='error-msg'>  Please enter valid detail<div>");
                                  errorCount++;
                              }
                          }else{
                              if($(this).is("input[type=email]")){
                                  var expr = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;

                                    if(!expr.test($(this).val())){
                                         $(this).after("<div class='error-msg'>"+$(this).attr('error')+"<div>");
                                        errorCount++;
                                    }
                              }
                              if($(this).is("input[type=tel]")){
                                if(isNaN($(this).val())){
                                    if($(this).attr('error')){
                                        $(this).after("<div class='error-msg'>"+$(this).attr('error')+"<div>");
                                        errorCount++;
                                     }else{
                                          $(this).after("<div class='error-msg'>  Please enter valid number<div>");
                                          errorCount++;
                                     }
                                }
                            }
                          }
                        }else{
                            if($(this).is("input[type=tel]")&&(!($(this).val() === "" || $(this).val() === " "))){
                                if(isNaN($(this).val())){
                                    if($(this).attr('error')){
                                        $(this).after("<div class='error-msg'>"+$(this).attr('error')+"<div>");
                                        errorCount++;
                                     }else{
                                          $(this).after("<div class='error-msg'>  Please enter valid number<div>");
                                          errorCount++;
                                     }

                                }
                            }
                      }

                  });
                  /*if(errorCount === 0){
                      //return true;
                      event.preventDefault();
                       //$('#find-an-amp').attr("disabled",true);
                       //$('#contact-us-form').attr("disabled",true);
                       var action = $form.prop('action');
                       action += (action.indexOf('?') !== -1) ? "&" : "?";
                       $.getJSON(action + $form.serialize() + "&callback=?").then(function(res) {
                         if (res === "OK") {
                           $form.html('<h3>Thank you! You should receive a confirmation shortly.</h3');
                         } else {
                            // $('#find-an-amp').attr("disabled",false);
                           //  $('#contact-us-form').attr("disabled",false);

                           $form.append('<span class="mz-validationmessage">Sorry, an error occurred. Please make sure all fields are filled out!</span>');
                         }
                       });

                  }else{
                      return false;
                  }*/

              });

              $('#contact-form-container input[type=text], #contact-form-container input[type=email], #contact-form-container input[type=tel], #contact-form-container textarea').on("keyup change",function(index){
                  $(this).next('.error-msg').remove();
              });

            //Order selections

            // if( ($( window ).width()) <= 780 ){
            //     alert("DEVELOPEMENT IN UNDER PROGESS")
            //     $('body').css('display','none');
            //     $('.mz-l-pagewrapper').css('display','none')
            // }

            $(document).on('click','input[name="radio"]',function(){
               var selected = $(this).val();
               $(".tabs").hide();
               $('.'+selected).show();
            });
            $(document).on('change','.pro-selction .dropdown select',function(){
               var selected = $(this).val();
               $(".tabs").hide();
               $('.'+selected).show();
            });


            $(".loggedin-msg .mz-utilitynav-link").text($.cookie("userEmail"));

         $(document).on("click",".ham",function(){
            $(".mobile-menu").css({"display":"block","left":"-88%"}).animate({"left":"0"}, "slow");
            $(".mz-homepage ").css("overflow","hidden");
         });
         $('#mblclose').on('click', function() {
            $(".mobile-menu").css({"display":"block","left":"0"}).animate({"left":"-88%"}, "slow");
            $("body").css("overflow","auto");
         });


            if(window.location.origin.indexOf('jellybellydsd')>-1){
                if (window.location.host.indexOf('east') === -1 && window.location.host.indexOf('west') ===-1){
                    $(".mz-column.mz-column-1 ul.jb-column-mainlist li a").attr("target","_blank");
                     $(".mz-sitenav-list li a").attr("target","_blank");
                    $("a[href$='order-history']").on("click",function(e){
                        e.preventDefault();
                        $(".history .modal-message").html("Please select a store to see its order history.").parents(".history").show();
                        $(".history .btn-yes").on("click",function(){
                            $('.modal.history').hide();
                          //  window.location = "/";
                        //  $(".history").hide();

                            //return false;
                        });
                    });
                }
            }else if(window.location.origin.indexOf('mozu')>-1){
                    if(window.location.host.split(".")[0].split("-")[1] === Hypr.getThemeSetting('wwwSiteLink').split(".")[0].split("-")[1]){
                        $(".mz-column.mz-column-1 ul.jb-column-mainlist li a").attr("target","_blank");
                        $(".mz-sitenav-list li a").attr("target","_blank");
                        $("a[href$='order-history']").on("click",function(e){
                            e.preventDefault();
                            $(".history .modal-message").html("Please select a store to see its order history.").parents(".history").show();
                            $(".history .btn-yes").on("click",function(){
                                $('.modal.history').hide();
                            //$(".history").hide();
                            });
                        });
                    }
            }

	$('a').click(function (e) {

	// gather the resources to which this account has access
	//var accountId = e.target.getAttribute('data-mz-accountid');
	// temp test value
	if (e.currentTarget.href.indexOf('/planograms') > -1) {
		e.preventDefault();
		$('#planogram-collection').empty();
		$('#planogram-collection').append("<h3 style='display: inline-block;'>PLANOGRAMS</h3><h3 class='planogram-close' style='float: right; display: inline-block; cursor: pointer; cursor: hand;'>X</h3>");
		$('#planogram-collection').append('<div id="planogram-collection-list"></div>');
	api.request('get','/svc/planogramInterface').then(function (response) {
		var myUser = require.mozuData('user');
		var planogramIndex = 0;
    var emailFound = false;
    $('#planogram-collection').show();
		_.each(response.items, function(planogram){
			if (planogram.accountList.indexOf(myUser.email) > -1) {
         emailFound = true;
				var pageNumber = 1;
				_.each(planogram.files, function(file) {
					$("#planogram-collection-list").append("<div class='planogram-item' style='padding: 5px; background: #E3B3C7; font-weight: bold; display: " + (pageNumber == 1 ? "block" : "none")+ "'>" + planogram.name.toUpperCase() + "<p><!--<a class='planogram-slide"+ planogramIndex +"' href='https://cdn-tp1.mozu.com/9046-m1/cms/files/" + file + "'>QUICKVIEW</a> | --><a target='_new' href='https://cdn-tp1.mozu.com/9046-m1/cms/files/"+planogram.pdf+"'>PDF</a></p></div>" );
					pageNumber++;
				});
				planogramIndex++;
      } else  {
        }
	});
      if (!emailFound) {
        $('#planogram-collection-list').html("<h3>Sorry, there is no Planogram for this store.</h3>");
      }

		}, function(error) { });
	}
	});

	$(document).on("click",".planogram-item",function (e) {
		$('#planogram-collection').css({ display: "none" });
    });
   $(document).on('click','.printableOrder',function(){
         $('.print-modal').addClass('display-block');
         $('.print-modal').show();
    });
    $(document).on('click',".printclose",function(){
         $(".print-modal").removeClass('display-block');
    });

	$(document).on('click',".planogram-close",function(){
        $('#planogram-collection').css({ display: "none" });
    });

    // $("body").on('click', function(){
    //      if( $('.print-modal').hasClass('display-block')) {
    //         $(".print-modal").removeClass('display-block');
    //       }
    //  });
    $(document).keyup(function(e) {
       if(e.keyCode === 27){
         if( $('.print-modal').hasClass('display-block')) {
            $(".print-modal").removeClass('display-block');
           }
       }
    });
         //setting order by email in order confirmation page
        var confirm = require.mozuData('pagecontext').pageType;
        if(confirm === "confirmation"){
            if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
                var userInfo =  $.cookie('userData');
                $('.userEmail').text( JSON.parse($.cookie('userData')).email);
            }/*else if(sessionStorage.getItem('Useremail')){
                $('.userEmail').text(sessionStorage.getItem('Useremail'));
            }*/

        }
        //  Setting the cookie value to session storage
        /*if($.cookie('userData')!== "null" && $.cookie('userData')!== undefined){
            sessionStorage.setItem('Useremail', JSON.parse($.cookie("userData")).email);
        }*/

        $(document).on('click','.fixtureColorbox', function(e) {
			var imgPath;
			if($(e.currentTarget).attr('big-img-src') == '//cdn-tp1.mozu.com/9046-m1/cms/files/Trade_Fixture_Bin_1.jpg'){
				imgPath = '//cdn-tp1.mozu.com/9046-m1/cms/files/Trade_Fixture_Bin_1.jpg';
			} else if($(e.currentTarget).attr('big-img-src') == '//cdn-tp1.mozu.com/9046-m1/cms/files/Trade_Fixture_Scoop_Bin_2.jpg'){
				imgPath = '//cdn-tp1.mozu.com/9046-m1/cms/files/Trade_Fixture_Scoop_Bin_2.jpg';
			} else if($(e.currentTarget).attr('big-img-src') == '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_1_Bin.jpg'){
				imgPath = '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_1_Bin.jpg';
			} else if($(e.currentTarget).attr('big-img-src') == '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_2_Bin.jpg'){
				imgPath = '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_2_Bin.jpg';
			} else if($(e.currentTarget).attr('big-img-src') == '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_3_Bin.jpg'){
				imgPath = '//cdn-tp1.mozu.com/9046-m1/cms/files/SMP_Gen_3_Bin.jpg';
			} else {
				alert("nothing selected");
			}

			$.colorbox({
				open : true,
				width : "60% !important",
				maxWidth : "100%",
				maxHeight : "100%",
				scrolling : false,
				fadeOut : 500,
				html : "<div style='maxWidth=100%; padding: 5px; background: #ffffff; text-align: center'><img src='" + imgPath + "?max=550' alt='Jelly Belly fixture'/></div>",
				overlayClose : true,
				closeButton : true,
				close : "close",
				trapFocus: false
			});
    });

    /*IE compatibility //v.r.s code*/
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      $(document).find('.dsdorderlabel').addClass('ie-fix');
    }

  });

});


var htmlEntities = {
  nbsp: ' ',
  cent: '¢',
  pound: '£',
  yen: '¥',
  euro: '€',
  copy: '©',
  reg: '®',
  lt: '<',
  gt: '>',
  quot: '"',
  amp: '&',
  apos: '\''
};

window.unescapeHTML = function unescapeHTML(str) {
  return str.replace(/\&([^;]+);/g, function (entity, entityCode) {
      var match;

      if (entityCode in htmlEntities) {
          return htmlEntities[entityCode];
          /*eslint no-cond-assign: 0*/
      } else if (match == entityCode.match(/^#x([\da-fA-F]+)$/)) {
          return String.fromCharCode(parseInt(match[1], 16));
          /*eslint no-cond-assign: 0*/
      } else if (match == entityCode.match(/^#(\d+)$/)) {
          return String.fromCharCode(~~match[1]);
      } else {
          return entity;
      }
  });
};