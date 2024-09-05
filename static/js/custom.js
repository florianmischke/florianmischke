jQuery(function($) {
    function focustrigger() {
        if(location.hash && location.hash != '') {
            var id = location.hash.substring(1)
            var el = $('#'+id)
            el.trigger('focus')
        }
    }

    $( window ).on( 'hashchange', function( e ) {
        focustrigger()
    } );
    focustrigger()
})