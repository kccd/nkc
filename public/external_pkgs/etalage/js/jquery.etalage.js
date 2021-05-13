/*
 * Title: jQuery Etalage plugin
 * Author: Berend de Jong, Frique
 * Author URI: http://www.frique.me/
 * Version: 1.3.4 (20130622.1)
 */

(function($){
	$.fn.etalage = function(options){

		// OPTION DEFAULTS
		var o = $.extend({
			align: 'left',						// Align of the Etalage container. The zoom area will appear on the opposite side ('left'/'right')
			thumb_image_width: 300,				// The large thumbnail width (excluding borders / padding) (value in pixels)
			thumb_image_height: 400,			// The large thumbnail height (excluding borders / padding) (value in pixels)
			source_image_width: 900,			// The source/zoomed image width (not the frame around it) (value in pixels)
			source_image_height: 1200,			// The source/zoomed image height (not the frame around it) (value in pixels)
			zoom_area_width: 600,				// Width of the zoomed image frame (including borders, padding) (value in pixels)
			zoom_area_height: 'justify',		// Height of the zoomed image frame (including borders, padding) (value in pixels / 'justify' = height of large thumb + small thumbs)
			zoom_area_distance: 10,				// Distance between the zoom area and thumbnail (value in pixels)
			zoom_easing: true,					// Ease the animation while moving the zoomed image (true/false)
			click_to_zoom: false,				// Will start zooming when image is clicked instead of when hovering (when true, click-callback functions are disabled) (true/false)
			zoom_element: 'auto',				// Supply your custom zoom area element as a CSS type selector ('auto'/'#selector'/'.selector')
			show_descriptions: true,			// Shows the description area if a title attribute is given to the source image (true/false)
			description_location: 'bottom',		// Location of the description area ('top'/'bottom')
			description_opacity: 0.7,			// Opacity of the description area (except for IE) (number between or equal to 0-1)
			small_thumbs: 3,					// How many small thumbnails will be visible underneath the large thumbnail (minimum of 3) (number)
			smallthumb_inactive_opacity: 0.4,	// Opacity of the inactive small thumbnails (number between or equal to 0-1)
			smallthumb_hide_single: true,		// Don't show the small thumb when there is only 1 image (true/false)
			smallthumb_select_on_hover: false,	// This will scroll through the small thumbnails when hovering them, instead of clicking them (true/false)
			smallthumbs_position: 'bottom',		// Where to position the row of small thumbnails ('top' / 'bottom' / 'left' / 'right')
			show_begin_end_smallthumb: true,	// Whether to show extra thumbnails at the beginning and the end that navigate back to the end or beginning (true/false)
			magnifier_opacity: 0.5,				// Opacity of the magnifier area (does not apply if magnifier_invert is true) (number between or equal to 0-1)
			magnifier_invert: true,				// Make the large thumbnail clear through the magnifier, opaque around it (opacity is the value of magnifier_opacity) (true/false)
			show_icon: true,					// Shows the icon image in the middle of the magnifier (only if magnifier_invert is false) and left-bottom of large thumb (true/false)
			icon_offset: 20,					// The icon's offset to the left-bottom corner (value in pixels)
			hide_cursor: false,					// Hides the cursor when hovering the large thumbnail (only works in some browsers) (true/false)
			show_hint: false,					// Show "hint" until image is zoomed for the first time (true/false)
			hint_offset: 15,					// The hint's offset to the right-top corner (value in pixels)
			speed: 600,							// All animation speeds are based on this setting (value in ms)
			autoplay: true,						// Makes the thumbs switch automatically when not interacting (at each autoplay_interval below) (true/false)
			autoplay_interval: 6000,			// Time showing each image if autoplay is on (value in ms)
			keyboard: true,						// Left/right arrow keys to navigate (true/false)
			right_to_left: false,				// Makes the thumbnails slide from right to left and the caption texts RTL (true/false)
			// Callback functions:				// These functions are automatically run when certain events trigger. Assign your own behaviour as a plugin option:
			click_callback: function(){			// Provide your own callback for the click event (function). Takes 2 arguments: image_anchor, instance_id
				return true;
			},
			change_callback: function(){		// Provide your own callback for the change event (thumb switching) (function). Takes 2 arguments: image_anchor, instance_id
				return true;
			}
		}, options);

		$.each(this, function(){
			var $container = $(this);

			// Verify if this is a UL, has atleast 1 LI and 1 source image
			if($container.is('ul') && $container.children('li').length && $container.find('img.etalage_source_image').length){

				var i, j, src, thumb_id, magnifier_opacity, autotimer, description, container_outerwidth, smallthumbs_overflow, css,
					instance_id = $container.attr('id'),
					faster = Math.floor(o.speed*0.7),
					zoom_follow_speed = Math.round(o.speed/100),
					st_moving = false,
					st_steps = 0,
					ie6 = false,
					preview = true,
					clicked_to_zoom = false,
					zoom_move_timer = 0,
					cur_zoomx = 0,
					cur_zoomy = 0,
					new_zoomx = 0,
					new_zoomy = 0,
					smallthumbs_align = 'hori';

				if(typeof instance_id==='undefined' || !instance_id){
					instance_id = '[no id]';
				}

				if(o.smallthumbs_position==='left' || o.smallthumbs_position==='right'){
					smallthumbs_align = 'vert';
				}

				// IE specifics
				if(typeof $.browser==='object' && $.browser.msie){
					if($.browser.version < 9){
						preview = false;
						if($.browser.version < 7){
							ie6 = true;
						}
					}
				}

// NEW ELEMENTS & CACHE
				$container.addClass('etalage').show();
				var $thumbs = $container.children('li').addClass('etalage_thumb');
				$thumbs.first().show().addClass('etalage_thumb_active');

				var images = $thumbs.length,
					autoplay = o.autoplay;
				if(images < 2){
					autoplay = false;
				}

				if(o.align==='right'){
					$container.addClass('etalage_right');
				}

				// Add/generate large thumbs (& check for existing thumb/source images)
				$.each($thumbs, function(i){
					i += 1;
					var $t = $(this),
						$t_thumb = $t.find('.etalage_thumb_image').removeAttr('alt').show(),
						$t_source = $t.find('.etalage_source_image'),
						$t_anchor = $t.find('a');
					$t.data('id', i).addClass('thumb_'+i);
					// No thumb, but source
					if(!$t_thumb.length && $t_source.length){
						$t.prepend('<img class="etalage_thumb_image" src="'+$t_source.attr('src')+'" />');
					}
					// No thumb and no source
					else if(!$t_thumb.length && !$t_source.length){
						$t.remove();
					}
					// Add anchor data to large thumbnail
					if($t_anchor.length){
						$t.find('.etalage_thumb_image').data('anchor', $t_anchor.attr('href'));
					}
				});
				var $thumb_images = $thumbs.find('.etalage_thumb_image').css({ width:o.thumb_image_width, height:o.thumb_image_height }).show();
				$.each($thumb_images, function(){
					$(this).data('src', this.src);
				});

				// Add magnifier
				var $magnifier = $('<li class="etalage_magnifier"><div><img /></div></li>').appendTo($container),
					$magnifier_img_area = $magnifier.children('div'),
					$magnifier_img = $magnifier_img_area.children('img');

				// Add zoom icon
				var $icon = $('<li class="etalage_icon">&nbsp;</li>').appendTo($container);
				if(o.show_icon){
					$icon.show();
				}

				// Add hint
				var $hint;
				if(o.show_hint){
					$hint = $('<li class="etalage_hint">&nbsp;</li>').appendTo($container).show();
				}

				// Add zoom area
				var $zoom,
					zoom_element = o.zoom_element;
				if(zoom_element!=='auto' && zoom_element && $(zoom_element).length){
					$zoom = $(zoom_element)
						.addClass('etalage_zoom_area')
						.html('<div><img class="etalage_zoom_img" /></div>');
				}else{
					zoom_element = 'auto';
					$zoom = $('<li class="etalage_zoom_area"><div><img class="etalage_zoom_img" /></div></li>').appendTo($container);
				}
				var $zoom_img_area = $zoom.children('div'),
					$zoom_preview;
				if(preview){
					$zoom_preview = $('<img class="etalage_zoom_preview" />').css({ width:o.source_image_width, height:o.source_image_height, opacity:0.3 }).prependTo($zoom_img_area).show();
				}
				var $zoom_img = $zoom_img_area.children('.etalage_zoom_img').css({ width:o.source_image_width, height:o.source_image_height });

				// Add description area
				var $description;
				if(o.show_descriptions){
					$description = $('<div class="etalage_description'+ ((o.right_to_left)?' rtl':'') +'"></div>').prependTo($zoom);
				}

				// Add/generate smallthumbs
				var $smallthumbs,
					$smallthumbs_ul,
					$smallthumb,
					$smallthumb_images,
					smallthumbs,
					small_thumbs = o.small_thumbs;
				if(images > 1 || !o.smallthumb_hide_single){
					$smallthumbs = $('<li class="etalage_small_thumbs"><ul></ul></li>').appendTo($container);
					$smallthumbs_ul = $smallthumbs.children('ul');
					$.each($thumb_images, function(){
						var $t = $(this);
						src = $t.data('src');
						thumb_id = $t.parents('.etalage_thumb').data('id');
						$('<li><img class="etalage_small_thumb" src="'+src+'" /></li>').data('thumb_id', thumb_id).appendTo($smallthumbs_ul);
					});
					$smallthumb = $smallthumbs_ul.children('li').css({ opacity:o.smallthumb_inactive_opacity });
					if(small_thumbs < 3){
						small_thumbs = 3;
					}
					// If more smallthumbs than visible
					if(images > small_thumbs){
						// Add extra thumb on each side
						if(o.show_begin_end_smallthumb){
							src = $thumb_images.eq(images-1).data('src');
							thumb_id = $thumbs.eq(images-1).data('id');
							$('<li class="etalage_smallthumb_first etalage_smallthumb_navtoend"><img class="etalage_small_thumb" src="'+src+'" /></li>')
								.data('src', src)
								.data('thumb_id', thumb_id)
								.css({ opacity:o.smallthumb_inactive_opacity })
								.prependTo($smallthumbs_ul);
							src = $thumb_images.eq(0).data('src');
							thumb_id = $thumbs.eq(0).data('id');
							$('<li class="etalage_smallthumb_navtostart"><img class="etalage_small_thumb" src="'+src+'" /></li>')
								.data('src', src)
								.data('thumb_id', thumb_id)
								.css({ opacity:o.smallthumb_inactive_opacity })
								.appendTo($smallthumbs_ul);
							$smallthumb = $smallthumbs_ul.children('li');

							// Set first active smallthumb
							$smallthumb.eq(1).addClass('etalage_smallthumb_active').css({ opacity:1 });
						}else{
							// Set first active smallthumb
							$smallthumb.eq(0).addClass('etalage_smallthumb_first etalage_smallthumb_active').css({ opacity:1 });
						}
						// Prepare for moving them left/right / up/down
						$smallthumb.eq(small_thumbs-1).addClass('etalage_smallthumb_last');
					}
					// Smallthumbs are within boundries
					else{
						// Set first active smallthumb
						$smallthumb.eq(0).addClass('etalage_smallthumb_active').css({ opacity:1 });
					}
					// Apply id
					$.each($smallthumb, function(i){
						$(this).data('id', (i+1));
					});
					$smallthumb_images = $smallthumb.children('img');
					smallthumbs = $smallthumb.length;
					// Vertical
					if(smallthumbs_align==='vert'){
						$smallthumb.addClass('vertical');
					}
				}

// PREPARE
				// Magnifier invert option
				if(o.magnifier_invert){
					magnifier_opacity = 1;
				}else{
					magnifier_opacity = o.magnifier_opacity;
				}

				// Determine (generated) dimensions
				var thumb_border = parseInt($thumbs.css('borderLeftWidth'), 10) + parseInt($thumbs.css('borderRightWidth'), 10) + parseInt($thumb_images.css('borderLeftWidth'), 10) + parseInt($thumb_images.css('borderRightWidth'), 10),
					thumb_margin = parseInt($thumbs.css('marginLeft'), 10) + parseInt($thumbs.css('marginRight'), 10),
					thumb_padding = parseInt($thumbs.css('paddingLeft'), 10) + parseInt($thumbs.css('paddingRight'), 10) + parseInt($thumb_images.css('marginLeft'), 10) + parseInt($thumb_images.css('marginRight'), 10) + parseInt($thumb_images.css('paddingLeft'), 10) + parseInt($thumb_images.css('paddingRight'), 10),
					thumb_outerwidth = o.thumb_image_width+thumb_border+thumb_margin+thumb_padding,
					thumb_outerheight = o.thumb_image_height+thumb_border+thumb_margin+thumb_padding,
					smallthumb_border = 0,
					smallthumb_margin = 0,
					smallthumb_padding = 0,
					smallthumb_width = 0,
					smallthumb_height = 0,
					smallthumb_outerwidth = 0,
					smallthumb_outerheight = 0;
				if(images > 1 || !o.smallthumb_hide_single){
					smallthumb_border = parseInt($smallthumb.css('borderLeftWidth'), 10) + parseInt($smallthumb.css('borderRightWidth'), 10) + parseInt($smallthumb_images.css('borderLeftWidth'), 10) + parseInt($smallthumb_images.css('borderRightWidth'), 10);
					smallthumb_margin = parseInt($smallthumb.css('marginTop'), 10);
					smallthumb_padding = parseInt($smallthumb.css('paddingLeft'), 10) + parseInt($smallthumb.css('paddingRight'), 10) + parseInt($smallthumb_images.css('marginLeft'), 10) + parseInt($smallthumb_images.css('marginRight'), 10) + parseInt($smallthumb_images.css('paddingLeft'), 10) + parseInt($smallthumb_images.css('paddingRight'), 10);
					if(smallthumbs_align==='vert'){
						smallthumb_height = Math.round((thumb_outerheight-((small_thumbs-1)*smallthumb_margin))/small_thumbs) - (smallthumb_border+smallthumb_padding);
						smallthumb_width = Math.round((o.thumb_image_width * smallthumb_height) / o.thumb_image_height);
						smallthumb_outerwidth = smallthumb_width+smallthumb_border+smallthumb_padding;
						smallthumb_outerheight = smallthumb_height+smallthumb_border+smallthumb_padding;
					}else{
						smallthumb_width = Math.round((thumb_outerwidth-((small_thumbs-1)*smallthumb_margin))/small_thumbs) - (smallthumb_border+smallthumb_padding);
						smallthumb_height = Math.round((o.thumb_image_height * smallthumb_width) / o.thumb_image_width);
						smallthumb_outerwidth = smallthumb_width+smallthumb_border+smallthumb_padding;
						smallthumb_outerheight = smallthumb_height+smallthumb_border+smallthumb_padding;
					}
				}

				var zoom_border = parseInt($zoom.css('borderTopWidth'), 10),
					zoom_margin = parseInt(o.zoom_area_distance, 10),
					zoom_padding = parseInt($zoom.css('paddingTop'), 10),
					zoom_area_width,
					zoom_area_height;
				// If source image width is smaller than zoom area
				if((o.zoom_area_width - (zoom_border*2) - (zoom_padding*2)) > o.source_image_width){
					zoom_area_width = o.source_image_width;
				}else{
					zoom_area_width = o.zoom_area_width - (zoom_border*2) - (zoom_padding*2);
				}
				if(o.zoom_area_height==='justify'){
					zoom_area_height = (thumb_outerheight+smallthumb_margin+smallthumb_outerheight) - (zoom_border*2) - (zoom_padding*2);
				}else{
					zoom_area_height = o.zoom_area_height - (zoom_border*2) - (zoom_padding*2);
				}
				// If source image height is smaller than zoom area
				if(zoom_area_height > o.source_image_height){
					zoom_area_height = o.source_image_height;
				}
				var description_border,
					description_margin,
					description_padding,
					description_width;
				if(o.show_descriptions){
					description_border = parseInt($description.css('borderLeftWidth'), 10) + parseInt($description.css('borderRightWidth'), 10);
					description_margin = parseInt($description.css('marginLeft'), 10) + parseInt($description.css('marginRight'), 10);
					description_padding = parseInt($description.css('paddingLeft'), 10) + parseInt($description.css('paddingRight'), 10);
					description_width = zoom_area_width - description_border - description_margin - description_padding;
				}
				// Add iframe underlay to resolve IE6 <select> tag bug
				var $ie6_iframe_fix;
				if(ie6){
					$ie6_iframe_fix = $('<iframe marginwidth="0" marginheight="0" scrolling="no" frameborder="0" src="javascript:\'<html></html>\'"></iframe>')
						.css({ position:'absolute', zIndex:1 })
						.prependTo($zoom);
				}

				var magnifier_border = parseInt($magnifier.css('borderTopWidth'), 10),
					magnifier_top = parseInt($thumbs.css('borderTopWidth'), 10) +
						parseInt($thumbs.css('marginTop'), 10) +
						parseInt($thumbs.css('paddingTop'), 10) +
						parseInt($thumb_images.css('borderTopWidth'), 10) +
						parseInt($thumb_images.css('marginTop'), 10) -
						magnifier_border,
					magnifier_left = $thumb_images.offset().left - $container.offset().left - magnifier_border;
				if(o.smallthumbs_position==='left'){
					magnifier_left = magnifier_left + smallthumb_outerwidth + smallthumb_margin;
				}else if(o.smallthumbs_position==='top'){
					magnifier_top = magnifier_top + smallthumb_outerheight + smallthumb_margin;
				}
				var magnifier_width = Math.round(zoom_area_width*(o.thumb_image_width / o.source_image_width)),
					magnifier_height = Math.round(zoom_area_height*(o.thumb_image_height / o.source_image_height)),
					magnifier_bottom = magnifier_top + o.thumb_image_height - magnifier_height,
					magnifier_right = magnifier_left + o.thumb_image_width - magnifier_width,
					magnifier_center_x = Math.round(magnifier_width/2),
					magnifier_center_y = Math.round(magnifier_height/2),
					hint_top,
					hint_right;
				if(o.show_hint){
					hint_top = parseInt(o.hint_offset, 10) + parseInt($hint.css('marginTop'), 10);
					hint_right = parseInt(o.hint_offset, 10) + parseInt($hint.css('marginRight'), 10);
					if(o.smallthumbs_position==='right'){
						hint_right = hint_right-smallthumb_outerwidth-smallthumb_margin;
					}
				}

// RESIZE AND REPOSITION ELEMENTS
				// Container
				if(smallthumbs_align==='vert'){
					container_outerwidth = thumb_outerwidth+smallthumb_margin+smallthumb_outerwidth;
					$container.css({ width:container_outerwidth, height:thumb_outerheight });
				}else{
					container_outerwidth = thumb_outerwidth;
					$container.css({ width:container_outerwidth, height:thumb_outerheight+smallthumb_margin+smallthumb_outerheight });
				}
				// Icon
				if(o.show_icon){
					css = { top:thumb_outerheight - $icon.outerHeight(true) - parseInt(o.icon_offset, 10), left:parseInt(o.icon_offset, 10) };
					if(o.smallthumbs_position==='left'){
						css.left = smallthumb_outerwidth + smallthumb_margin + parseInt(o.icon_offset, 10);
					}else if(o.smallthumbs_position==='top'){
						css.top += smallthumb_outerheight + smallthumb_margin;
					}
					$icon.css(css);
				}
				// Hint
				if(o.show_hint){
					$hint.css({ margin:0, top:-hint_top, right:-hint_right });
				}
				// Magnifier
				$magnifier_img.css({ margin:0, padding:0, width:o.thumb_image_width, height:o.thumb_image_height });
				$magnifier_img_area.css({ margin:0, padding:0, width:magnifier_width, height:magnifier_height });
				css = { margin:0, padding:0, left:(magnifier_right-magnifier_left)/2, top:(magnifier_bottom-magnifier_top)/2 };
				if(o.smallthumbs_position==='left'){
					css.left = '+=' + smallthumb_outerwidth + smallthumb_margin;
				}else if(o.smallthumbs_position==='top'){
					css.top = '+=' + smallthumb_outerheight + smallthumb_margin;
				}
				$magnifier.css(css).hide();
				// Zoom area
				$zoom_img_area.css({ width:zoom_area_width, height:zoom_area_height });
				css = { margin:0, opacity:0 };
				if(o.align==='right' && zoom_element==='auto'){
					css.left = -(zoom_area_width + (zoom_border*2) + (zoom_padding*2) + zoom_margin);
				}else if(zoom_element==='auto'){
					css.left = container_outerwidth + zoom_margin;
				}
				$zoom.css(css).hide();
				// Descriptions
				if(o.show_descriptions){
					css = { width:description_width, bottom:zoom_padding, left:zoom_padding, opacity:o.description_opacity };
					if(o.description_location==='top'){
						css.top = zoom_padding;
						css.bottom = 'auto';
					}
					$description.css(css).hide();
				}
				// Small thumbs
				if(images > 1 || !o.smallthumb_hide_single){
					if(smallthumbs_align==='vert'){
						css = { top:0, height:thumb_outerheight };
						if(o.smallthumbs_position==='left'){
							$thumbs.css({ left:smallthumb_outerwidth+smallthumb_margin });
						}else{
							css.marginLeft = thumb_outerwidth + smallthumb_margin;
						}
						$smallthumbs.css(css);
						$smallthumbs_ul.css({ height:(smallthumb_outerheight*smallthumbs) + (smallthumbs*smallthumb_margin) + 100 }); //100 = some extra to prevent a browser zoom glitch fix
						$smallthumb_images.css({ width:smallthumb_width, height:smallthumb_height }).attr('height', smallthumb_height);
						$smallthumb.css({ margin:0, marginBottom:smallthumb_margin });
					}else{
						css = { width:thumb_outerwidth };
						if(o.smallthumbs_position==='top'){
							$thumbs.css({ top:smallthumb_outerheight+smallthumb_margin });
						}else{
							css.top = thumb_outerheight + smallthumb_margin;
						}
						$smallthumbs.css(css);
						$smallthumbs_ul.css({ width:(smallthumb_outerwidth*smallthumbs) + (smallthumbs*smallthumb_margin) + 100 }); //100 = some extra to prevent a browser zoom glitch fix
						$smallthumb_images.css({ width:smallthumb_width, height:smallthumb_height }).attr('width', smallthumb_width);
						$smallthumb.css({ margin:0, marginRight:smallthumb_margin });
					}

					// Smallthumbs overflow fix for unmatching space (width/height of visible smallthumbs + their margins is more than the container width/height:
					if(smallthumbs_align==='vert'){
						smallthumbs_overflow = ((smallthumb_outerheight*small_thumbs) + ((small_thumbs-1)*smallthumb_margin)) - thumb_outerheight;
					}else{
						smallthumbs_overflow = ((smallthumb_outerwidth*small_thumbs) + ((small_thumbs-1)*smallthumb_margin)) - thumb_outerwidth;
					}
					// Overflow*1px decrease
					if(smallthumbs_overflow > 0){
						// Each set
						for(i=1; i<=(smallthumbs-1); i=i+(small_thumbs-1)){
							j=1;
							// Each smallthumb
							for(j; j<=smallthumbs_overflow; j+=1){
								if(smallthumbs_align==='vert'){
									$smallthumb.eq(i+j-1).css({ marginBottom:(smallthumb_margin-1) });
								}else{
									$smallthumb.eq(i+j-1).css({ marginRight:(smallthumb_margin-1) });
								}
							}
						}
					}
					// Overflow*1px increase
					else if(smallthumbs_overflow < 0){
						for(i=1; i<=(smallthumbs-1); i=i+(small_thumbs-1)){
							j=1;
							// Each smallthumb
							for(j; j<=(-smallthumbs_overflow); j+=1){
								if(smallthumbs_align==='vert'){
									$smallthumb.eq(i+j-1).css({ marginBottom:(smallthumb_margin+1) });
									$smallthumbs_ul.css({ height:parseInt($smallthumbs_ul.css('height'), 10)+1 });
								}else{
									$smallthumb.eq(i+j-1).css({ marginRight:(smallthumb_margin+1) });
									$smallthumbs_ul.css({ width:parseInt($smallthumbs_ul.css('width'), 10)+1 });
								}
							}
						}
					}
				}

				if(o.show_icon && !o.magnifier_invert){
					$magnifier.css({ background:$magnifier.css('background-color')+' '+$icon.css('background-image')+' center no-repeat' });
				}
				if(o.hide_cursor){
					$magnifier.add($icon).css({ cursor:'none' });
				}
				if(ie6){
					$ie6_iframe_fix.css({ width:$zoom_img_area.css('width'), height:$zoom_img_area.css('height') });
				}

// INITIATE FIRST RUN

				var $current_thumb = $thumbs.first().find('.etalage_thumb_image'),
					$current_source = $thumbs.first().find('.etalage_source_image');
				if(o.magnifier_invert){
					$magnifier_img.attr('src', $current_thumb.data('src')).show();
				}
				if(preview){
					$zoom_preview.attr('src', $current_thumb.data('src'));
				}
				$zoom_img.attr('src', $current_source.attr('src'));
				if(o.show_descriptions){
					description = $current_source.attr('title');
					if(description){
						$description.html(description).show();
					}
				}

// FUNCTIONS

				// Autoplay
				var stopAutoplay = function(){
					if(autotimer){
						clearInterval(autotimer);
						autotimer = false;
					}
				};
				var startAutoplay = function(){
					if(autotimer){
						stopAutoplay();
					}
					autotimer = setInterval(function(){
						next();
					}, o.autoplay_interval);
				};

				// Start zooming
				var start_zoom = function(){
					$magnifier.stop().fadeTo(faster, magnifier_opacity);
					$icon.stop().animate({ opacity:0 }, faster);
					$zoom.stop().show().animate({ opacity:1 }, faster);
					// Magnifier invert option
					if(o.magnifier_invert){
						$current_thumb.stop().animate({ opacity:o.magnifier_opacity }, faster);
					}
					// Pause autoplay
					if(autoplay){
						stopAutoplay();
					}
				};

				// Stop zooming
				var stop_zoom = function(){
					$magnifier.stop().fadeOut(o.speed);
					$icon.stop().animate({ opacity:1 }, o.speed);
					$zoom.stop().animate({ opacity:0 }, o.speed, function(){
						$(this).hide();
					});
					// Magnifier invert option
					if(o.magnifier_invert){
						$current_thumb.stop().animate({ opacity:1 }, o.speed, function(){
							if(o.click_to_zoom){
								clicked_to_zoom = false;
							}
						});
					}
					clearTimeout(zoom_move_timer);
					// Restart autoplay
					if(autoplay){
						startAutoplay();
					}
				};

				// Switch active thumb
				var st_click = function($next_active, moved){
					var $next_thumb,
						image_number,
						$active = $container.find('.etalage_smallthumb_active').removeClass('etalage_smallthumb_active');
					$next_active.addClass('etalage_smallthumb_active');
					// Make sure the magnifier is hidden
					$magnifier.stop().hide();
					// Make sure the zoom area is hidden
					$zoom.stop().hide();
					// Switch small thumb
					if(!moved){
						st_moving = true;
						$active.stop(true,true).animate({ opacity:o.smallthumb_inactive_opacity }, faster);
						$next_active.stop(true,true).animate({ opacity:1 }, faster, function(){
							st_moving = false;
						});
					}
					// Switch large thumb
					$container.find('.etalage_thumb_active').removeClass('etalage_thumb_active').stop().animate({ opacity:0 }, o.speed, function(){
						$(this).hide();
					});
					$next_thumb = $thumbs.filter('.thumb_'+$next_active.data('thumb_id')).addClass('etalage_thumb_active').show().stop().css({ opacity:0 }).animate({ opacity:1 }, o.speed);
					$current_thumb = $next_thumb.find('.etalage_thumb_image');
					$current_source = $next_thumb.find('.etalage_source_image');
					// Switch magnifier
					if(o.magnifier_invert){
						$magnifier_img.attr('src', $current_thumb.data('src'));
					}
					// Switch zoom image
					if(preview){
						$zoom_preview.attr('src', $current_thumb.data('src'));
					}
					$zoom_img.attr('src', $current_source.attr('src'));
					// Switch/hide/show description
					if(o.show_descriptions){
						description = $current_source.attr('title');
						if(description){
							$description.html(description).show();
						}else{
							$description.hide();
						}
					}
					// Reset autoplay
					if(autoplay){
						stopAutoplay();
						startAutoplay();
					}
					// Trigger change-callback
					image_number = $next_active.data('id');
					if(images >= small_thumbs){
						image_number--;
					}
					change_callback(image_number);
				};

				// Smallthumbs sliding
				var st_move = function(distance, $next_first, $next_last, $next_active){
					$.each($smallthumb, function(){
						var $this = $(this),
							animation = {
							opacity: o.smallthumb_inactive_opacity
						};
						if($this.data('id') === $next_active.data('id')){
							animation.opacity = 1;
						}
						if(smallthumbs_align==='vert'){
							animation.top = '-='+distance;
						}else{
							animation.left = '-='+distance;
						}
						$this.animate(animation, faster, 'swing', function(){
							if(st_moving){
								$next_active.addClass('etalage_smallthumb_active');
								st_moving = false;
							}
						});
					});
					// Switch thumb
					st_click($next_active, true);
				};

				// Moving the zoomed image
				var zoom_move = function(){
					var diff_x = new_zoomx - cur_zoomx,
						diff_y = new_zoomy - cur_zoomy,
						movethismuchnow_x = -diff_x / zoom_follow_speed,
						movethismuchnow_y = -diff_y / zoom_follow_speed;
					cur_zoomx = cur_zoomx - movethismuchnow_x;
					cur_zoomy = cur_zoomy - movethismuchnow_y;
					if(diff_x < 1 && diff_x > -1){
						cur_zoomx = new_zoomx;
					}
					if(diff_y < 1 && diff_y > -1){
						cur_zoomy = new_zoomy;
					}
					// Move a bit
					$zoom_img.css({ left:cur_zoomx, top:cur_zoomy });
					if(preview){
						$zoom_preview.css({ left:cur_zoomx, top:cur_zoomy });
					}
					// Repeat
					if(diff_x > 1 || diff_y > 1 || diff_x < 1 || diff_y < 1){
						zoom_move_timer = setTimeout(function(){
							zoom_move();
						}, 25);
					}
				};

				// Navigate to previous image
				var prev = function(){
					var $prev;
					if(o.magnifier_invert){
						$container.find('.etalage_thumb_active').mouseleave();
					}
					if(!o.right_to_left){
						$prev = $container.find('.etalage_smallthumb_active').prev();
						if(!$prev.length){
							if(images > small_thumbs){
								st_slide_to_end();
							}else{
								$smallthumb.last().trigger('click');
							}
							return true;
						}
					}else{
						$prev = $container.find('.etalage_smallthumb_active').next();
						if(!$prev.length){
							if(images > small_thumbs){
								st_slide_to_start();
							}else{
								$smallthumb.first().trigger('click');
							}
							return true;
						}
					}
					$prev.trigger('click');
				};

				// Navigate to next image
				var next = function(){
					var $next;
					if(o.magnifier_invert){
						$container.find('.etalage_thumb_active').mouseleave();
					}
					if(!o.right_to_left){
						$next = $container.find('.etalage_smallthumb_active').next();
						if(!$next.length){
							if(images > small_thumbs){
								st_slide_to_start();
							}else{
								$smallthumb.first().trigger('click');
							}
							return true;
						}
					}else{
						$next = $container.find('.etalage_smallthumb_active').prev();
						if(!$next.length){
							if(images > small_thumbs){
								st_slide_to_end();
							}else{
								$smallthumb.last().trigger('click');
							}
							return true;
						}
					}
					$next.trigger('click');
				};

				// Navigate to specific image
				var show = function(number){
					if(images <= small_thumbs || !o.show_begin_end_smallthumb){
						number = number-1;
					}
					var $number = $smallthumb.eq(number);
					if($number.length && !st_moving){
						var $active = $container.find('.etalage_smallthumb_active'),
							active = $active.data('id')-1,
							difference;
						// Move backward
						if(active > number){
							st_steps = active - number;
							var $first = $container.find('.etalage_smallthumb_first'),
								firstid = $first.data('id');
							if(number < firstid){
								difference = active - firstid;
								st_steps = st_steps - difference;
								$first.trigger('click');
							}else{
								st_click($number, false);
							}
						}
						// Move forward
						else if(active < number){
							st_steps = number - active;
							var $last = $container.find('.etalage_smallthumb_last'),
								lastid = $last.data('id')-1;
							if(number >= lastid){
								difference = lastid - active - 1;
								st_steps = st_steps - difference;
								$last.trigger('click');
							}else{
								st_click($number, false);
							}
						}
					}
				};

// EXTERNAL FUNCTIONS

				// Navigate to previous image
				window[instance_id+'_previous'] = function(){
					prev();
				};

				// Navigate to next image
				window[instance_id+'_next'] = function(){
					next();
				};

				// Navigate to specific image
				window[instance_id+'_show'] = function(number){
					show(number);
				};

// CALLBACK FUNCTIONS

				// Thumb click callback
				// Return false === do not trigger regular click event
				var click_callback = function(image_anchor){
					// Plugin option callback
					if(!o.click_callback(image_anchor, instance_id)){
						return false;
					}
					// Legacy support
					if(typeof etalage_click_callback === 'function'){
						etalage_click_callback(image_anchor, instance_id);
						return false;
					}
					return true;
				};

				// Thumb switched callback
				var change_callback = function(image_number){
					// Plugin option callback
					if(o.change_callback(image_number, instance_id)){
						// Legacy support
						if(typeof etalage_change_callback === 'function'){
							etalage_change_callback(image_number, instance_id);
						}
					}
				};

// ACTIONS

				// Thumb hover
				$thumbs.add($magnifier).add($icon).mouseenter(function(){
					// Hide hint
					if(o.show_hint){
						$hint.hide();
					}
					// Start zooming
					if(!o.click_to_zoom || clicked_to_zoom){
						start_zoom();
					}
				}).mouseleave(function(){
					stop_zoom();
				});

				// Magnifier movement
				var max_zoomx = -(o.source_image_width-zoom_area_width),
					max_zoomy = -(o.source_image_height-zoom_area_height);
				$thumbs.add($magnifier).add($icon).mousemove(function(e){
					var mouse_x = Math.round( e.pageX - $current_thumb.offset().left + magnifier_left ),
						mouse_y = Math.round( e.pageY - $current_thumb.offset().top + magnifier_top );

					// Magnifier location
					var new_x = (mouse_x-magnifier_center_x),
						new_y = (mouse_y-magnifier_center_y);
					if(new_x < magnifier_left){ new_x = magnifier_left; }
					if(new_x > magnifier_right){ new_x = magnifier_right; }
					if(new_y < magnifier_top){ new_y = magnifier_top; }
					if(new_y > magnifier_bottom){ new_y = magnifier_bottom; }
					$magnifier.css({ left:new_x, top:new_y });

					// Magnifier invert option
					if(o.magnifier_invert){
						var invert_x = new_x-magnifier_left,
							invert_y = new_y-magnifier_top;
						$magnifier_img.css({ left:-invert_x, top:-invert_y });
					}

					// Zoomed area scrolling
					new_zoomx = -( (new_x-magnifier_left) * (1/(o.thumb_image_width/o.source_image_width)) );
					new_zoomy = -( (new_y-magnifier_top) * (1/(o.thumb_image_height/o.source_image_height)) );
					if(new_zoomx < max_zoomx){ new_zoomx = max_zoomx; }
					if(new_zoomy < max_zoomy){ new_zoomy = max_zoomy; }
					if(o.zoom_easing){
						clearTimeout(zoom_move_timer);
						zoom_move();
					}
					else{
						if(preview){
							$zoom_preview.css({ left:new_zoomx, top:new_zoomy });
						}
						$zoom_img.css({ left:new_zoomx, top:new_zoomy });
					}
				});

function st_shift_1(direction){
	st_steps = (st_steps) ? st_steps-1 : 0;
	st_moving = true;
	var $first = $container.find('.etalage_smallthumb_first').removeClass('etalage_smallthumb_first');
	var $last = $container.find('.etalage_smallthumb_last').removeClass('etalage_smallthumb_last');
	var $next_first, $next_last, $next_active, distance;
	if(direction === 'left'){
		$next_first = $first.prev().addClass('etalage_smallthumb_first');
		$next_last = $last.prev().addClass('etalage_smallthumb_last');
		$next_active = $first;
	}else{
		$next_first = $first.next().addClass('etalage_smallthumb_first');
		$next_last = $last.next().addClass('etalage_smallthumb_last');
		$next_active = $last;
	}
	// If more steps
	if(st_steps){
		if(direction==='left'){
			$next_first.trigger('click');
		}else{
			$next_last.trigger('click');
		}
	}
	// Move & select new thumb
	else{
		// Get position
		distance = (smallthumbs_align==='vert') ? $next_first.position().top : $next_first.position().left;
		st_move(distance, $next_first, $next_last, $next_active);
	}
}
function st_slide_to_startend(to){
	st_moving = true;
	var $first = $container.find('.etalage_smallthumb_first').removeClass('etalage_smallthumb_first');
	var $last = $container.find('.etalage_smallthumb_last').removeClass('etalage_smallthumb_last');
	var $next_first, $next_last, $next_active;
	if(to==='end'){
		$next_first = $smallthumb.eq(smallthumbs-small_thumbs).addClass('etalage_smallthumb_first');
		$next_last = $smallthumb.eq(smallthumbs-1).addClass('etalage_smallthumb_last');
		$next_active = $next_last;
		if($next_last.hasClass('etalage_smallthumb_navtostart')){
			$next_active = $next_last.prev();
		}
	}else{
		$next_first = $smallthumb.eq(0).addClass('etalage_smallthumb_first');
		$next_last = $smallthumb.eq(small_thumbs-1).addClass('etalage_smallthumb_last');
		$next_active = $next_first;
		if($next_first.hasClass('etalage_smallthumb_navtoend')){
			$next_active = $next_first.next();
		}
	}
	// Get position
	var distance = (smallthumbs_align==='vert') ? $next_first.position().top : $next_first.position().left;
	// Move & select new thumb
	st_move(distance, $next_first, $next_last, $next_active);
}
function st_slide_to_start(){
	st_slide_to_startend('start');
}
function st_slide_to_end(){
	st_slide_to_startend('end');
}

				// Smallthumb behaviour
				if(images > 1 || !o.smallthumb_hide_single){
					// Smallthumb click event
					$smallthumb.click(function(){
						var $this = $(this),
							i,
							distance = 0,
							dont_move = false,
							$first,
							$last,
							$next_first,
							$next_last,
							$next_active;
						// If not active thumb & not already moving
						if(!$this.hasClass('etalage_smallthumb_active') && (!st_moving || st_steps)){

							// Slide left / up
							if($this.hasClass('etalage_smallthumb_first') && $this.prev().length){
								st_shift_1('left');
							}
							// Shift to end
							else if($this.hasClass('etalage_smallthumb_navtoend')){
								st_slide_to_end();
							}

							// Slide right / down
							else if($this.hasClass('etalage_smallthumb_last') && $this.next().length){
								st_shift_1('right');
							}
							// Shift to beginning
							else if($this.hasClass('etalage_smallthumb_navtostart')){
								st_slide_to_start();
							}

							// Regular click without moving smallthumbs
							else{
								// If still stepping and this is the last
								if(st_steps && !$(this).next().length){
									st_slide_to_end();
									return true;
								}
								// If still stepping and this is the first
								else if(st_steps && !$(this).prev().length){
									st_slide_to_start();
									return true;
								}
								st_click($this, false);
							}

						}
					});

					// Smallthumb hover
					if(o.smallthumb_select_on_hover){
						$smallthumb.mouseenter(function(){
							$(this).trigger('click');
						});
					}

				}

				// Large thumbnail click to zoom
				if(o.click_to_zoom){
					$thumbs.click(function(){
						clicked_to_zoom = true;
						start_zoom();
					});
				}
				// Large thumbnail click callback
				else{
					$magnifier.click(function(){
						var image_anchor = $current_thumb.data('anchor');
						if(image_anchor){
							// Click callback function
							if(click_callback(image_anchor)){
								// Regular href action
								window.location = image_anchor;
							}
						}
					});
				}

				if(images > 1 && o.keyboard){
					// Keystrokes
					$(document).keydown(function(e){
						// Right arrow = move right / down
						if(e.keyCode===39 || e.keyCode==='39'){
							if(!o.right_to_left){
								next();
							}else{
								prev();
							}
						}
						// Left arrow = move left / up
						if(e.keyCode===37 || e.keyCode==='37'){
							if(!o.right_to_left){
								prev();
							}else{
								next();
							}
						}
					});
				}

				// Remove loading gifs when full page is loaded
				$(window).bind('load', function(){
					// Large thumbnail background image
					$thumbs.css({ 'background-image':'none' });
					// Zoom background image
					$zoom.css({ 'background-image':'none' });
					// Remove zoom preview
					if(preview){
						preview = false;
						$zoom_preview.remove();
					}
				});

				// Initiate first autoplay
				if(autoplay){
					startAutoplay();
				}

			}
		});
		return this;
	};
})(jQuery);