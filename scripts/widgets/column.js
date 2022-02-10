require([
    "modules/jquery-mozu", "underscore", 
    "hyprlive", "modules/backbone-mozu"
    ],function ($,_,Hypr, Backbone) {
    
        $(document).ready(function () {      
            // alert("sdf");  
            $('.jb-column-mobile').click(function (e) {
                // if($(this).find('a').attr('href') == undefined){
                $('.jb-column-mainlist').slideUp(function () {
                    $(this).parent().find('.jb-column-heading-mobile').removeClass('jb-column-heading-current');
                      $(this).parent().find('.jb-column-mobile').removeClass('bgheadcolor');
                });
                // }
                if (e.currentTarget.nextElementSibling.style.display === "none" || e.currentTarget.nextElementSibling.style.display === "") {
                    e.preventDefault();
                    $(e.currentTarget.nextElementSibling).slideDown(function () {
                        // $('.jb-column-heading-mobile ').css({'background':none});
                        $(this).parent().find('.jb-column-heading-mobile').addClass('jb-column-heading-current');
                          $(this).parent().find('.jb-column-mobile').addClass('bgheadcolor');
                         if($(window).width()<=767){
                              if($(this).parents('.mz-column').hasClass('mz-column-2')){ 
                                 $(this).parents().find('.mz-column-3 .jb-column-mainlist').css('display','block');  
                              }
                              else{
                                  $(this).parents().find('.mz-column-3 .jb-column-mainlist').css('display','none');   
                              }
                            // $(this).parents(".mz-column").hasClass("mz-column-2").find('.mz-column-3 .jb-column-mainlist').css('display','block');
                         }
                         else{ 
                          
                         }
                    });
                }

            });

        });
        
});








