var jd_flickr = function (id, displayed, size) {
	displayed = typeof displayed !== 'undefined' ? displayed : 3;
	
	
	this.user_id = id;
	this.num_displayed = displayed;
	this.results = null;
	this.size = size;
	this.first_run = true;
	
	this.get_flickr = function (forceUpdate)
	{
		forceUpdate = typeof forceUpdate !== 'undefined' ? forceUpdate : false;

		
		// don't run the AJAX request a second time if we already have it stored
		if (this.results && !forceUpdate)
		{
			this.output_flickrImages();
			return;
		}
		
		var flickr_url = 'https://api.flickr.com/services/feeds/photos_faves.gne?id=' + this.user_id + '&format=json&jsoncallback=?';
		
		var xhr = jQuery.getJSON(flickr_url)
			.done ( this.parseFlickrResults )
			.fail ( function ( data, req ) { 
				console.log ( 'Error loading Flickr data' );
				console.log ( req );
			} )
			.always ( function ( data, req ) {
				console.log ( 'Flickr loading completed' );
			});
	}
	
	this.parseResults = function ( results, resp, req ) {
		console.log ( 'Successfully loaded from Flickr' );

		// Todo: Error checking
		
		this.results = results;
		
		this.output_flickrImages();
	}
	
		
	// Bind the object's THIS for use by the AJAX callbacks so that we can send
	// the results back to the object's instance
	this.parseFlickrResults = this.parseResults.bind(this)
	
	// Offset is 0-based
	this.output_flickrImages = function ( offset ) {
		offset = typeof offset !== 'undefined' ? offset : 0;
		
		var title = this.results.title, 
			count = this.results.items.length, 
			elm, 
			src_m,
			src,
			start = 0, 
			end = count - 1, // Start with end at the final item; in other words, convert to 0-based
			num = this.num_displayed;
		
		var html = '<h1>' + title + ' (' + count + ')</h1>';
		
		
		// Ensure offset is always positive
		offset = Math.abs(offset);
		
		// Calculate START so we don't go over the number of items
		if (offset + num > end)
			start = end - (num - 1); // Subtract 1 since end is 0-based
		else
			start = offset;
		
		
		// Calculate END so we don't go over the number of items
		if (start + num > end)
			end = end;
		else
			end = start + (num - 1); // Subtract 1 since end is 0-based
		
		
		// Loop through images to generate HTML
		for ( var i = start; i <= end; i++ ) {
			elm = this.results.items[i];
			src_m = elm.media.m; // Mobile image
			
			// Get the larger-size image URL
			src = src_m.replace('_m.jpg', '.jpg');
			
			html += '<a href="' + elm.link + '" rel="nofollow"><img src="' + (this.size == 'small' ? src_m : src) + '" alt="' + elm.title  + '"></a>';
		}
		
		jQuery('#' + (this.user_id).replace('@', '_')).html(html);
		
		// Only gen pagination controls if this is the first run
		if (this.first_run)
			this.generate_pagination();
		
		this.first_run = false;
	}
	
	this.generate_pagination = function () {
		var options;
		var num = this.num_displayed;
		var form = jQuery('#' + (this.user_id).replace('@', '_') + ' + form');
		var pagination_control = [];
		var i = 0;
		
		
		// Generate pagination
		i = 0;
		do {
			options += '<option value="' + i + '">';
			options += (i + 1) + ' to ' + (i + num > this.results.items.length ? this.results.items.length : i + num);
			options += '</option>';
			
			i = i + num;
		} while ( i < this.results.items.length )
						
		form.find('.flickr-pagination').html(options);
		
		form.find('.flickr-pagination').on('change', this, function (me) {
			var val = jQuery(this).val();
			
			me.data.output_flickrImages(val);
		});
		
		
		
		// Generate pagination controls
		pagination_control[3] = '<option value=3>3</option>';
		pagination_control[5] = '<option value=5>5</option>';
		pagination_control[10] = '<option value=10>10</option>';
		pagination_control[20] = '<option value=20>20</option>';
		pagination_control[num] = '<option value=' + num + ' selected>' + num + '</option>';
		
		form.find('.flickr-pagination-controls').html( pagination_control.toString().replace(',', '') );

		form.find('.flickr-pagination-controls').on('change', this, function (me) {
			var val = jQuery(this).val();
			
			// trigger pagination to update
			me.data.first_run = true;
			me.data.num_displayed = parseInt(val);
			
			me.data.output_flickrImages();
		});
	}
}