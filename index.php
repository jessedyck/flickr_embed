<?php
/*
	Plugin Name: Jesse Dyck - Flickr
	Plugin URI:  http://jessedyck.me
	Description: Adds shortcodes to display flickr favourites
	Version:     0.1
	Author:      Jesse Dyck
	Author URI:  http://jessedyck.me
*/

add_action ( 'wp_enqueue_scripts' , function () {
	wp_enqueue_script( 'jd_flickr_js', plugin_dir_url(__FILE__) . 'js/scripts.js', array('jquery'), null, true );

} );

add_shortcode ( 'jd_flickr_gallery', 'jd_flickr_gallery' );

function jd_flickr_gallery ($args) {
	$html = '';
	
	// Get user ID from username
	$user_id = jd_get_flickr_id ($args['username']);
	
	// Bail if we couldn't get the userid
	if (!$user_id) return false;
		
	// Sanitize size arg
	$size = isset($args['size']) ? strtolower($args['size']) : 'small';


	// ToDo: Add custom sizes
	if ($size == 'large' || $size == 'lg')
		$size = 'large';
	else if ($size == 'small' || $size == 'sm')
		$size = 'small';
		
	
	// Convert Flickr ID to an HTML-safe ID
	$id_js = str_replace('@', '_', $user_id);
	
	// Get the numebr of images to display, or default to 3	
	$flickr_results = isset($args['results']) ? $args['results'] : 3;
	
	$html .= '<style>.flickr-target img, .flickr-target a { display: inline-block; }</style>';
	
	// Generate HTMl
	$html .= '<div class="flickr-target ' . $size . '" id="' . $id_js . '"></div>';
	$html .= '<form>';
	$html .= '<select class="flickr-pagination"></select>';
	$html .= '<select class="flickr-pagination-controls"></select>';
	$html .= '</form>';
	$html .= '<script>
		var flickr_' . $id_js . ';
		jQuery(function () {
			flickr_' . $id_js .' = new jd_flickr( "' . $user_id . '", ' . $flickr_results . ', "' . $size . '" );
			flickr_' . $id_js .'.get_flickr();
		});
	</script>';
	
	return $html;
}

function jd_get_flickr_id ($username) {
	$start = time();
	
	// Check for a cached Transient before getting the ID from Flickr
	if ( false === ( $id = get_transient( 'jd_flickr_userid_' . $username ) ) ) {
		require_once 'phpflickr-master/phpFlickr.php';
		
		$key = '14d72f107cc402e3cc0a0432a007427d';
		$secret = '23f89b0c8e3a1d1e';
		
		$f = new phpFlickr($key, $secret);
		
		$user = $f->people_findByUsername ( $username );
		
		$id = $user['id'];
		
		if ( isset($id) )
			set_transient( 'jd_flickr_userid_' . $username, $id, 1 * DAY_IN_SECONDS );
	}

	$time_taken = time() - $start;
		
	return ( isset($id) ? $id : false );
}

?>