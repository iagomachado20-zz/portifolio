var structure = {
    init: function() {
        this.sticky();
    },
    sticky: function() {
        var heightHeader = $('.main-header').height();

        $(window).scroll(function(){

            var position = $('body').scrollTop();

            if (position > heightHeader) {
                $('.main-header').addClass('active');
            }
            else {
                $('.main-header').removeClass('active');
            }

        });
        
    }
};


jQuery(function(){
    structure.init();
});