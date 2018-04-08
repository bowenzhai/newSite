$(function() {
    // Smooth scrool
	$('a[href*="#"]:not([href="#"])').click(function() {
		if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
			var target = $(this.hash);
			target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
			if (target.length) {
				$('html, body').animate({
					scrollTop: (target.offset().top)
				}, 500);
				return false;
			}
		}
	});

	// on scroll
	$(window).scroll(function() {
		var windowPos = $(window).scrollTop();
		$("body > div").slice(1).each(function (index) {
			if (windowPos < $(this).position().top) {
				setActive(index);
				return false;
			}
		});
	});

	// set active nav link
	function setActive(index) {
		var translateAmout = index * -52;
		$("#side-nav-links .current-section").removeClass("current-section");
		$("#side-nav-links a").eq(index).addClass("current-section");
		var translation = "translateY(" + translateAmout + "px)";
		$("#side-nav-links").css("transform", translation);
	}

	// project hover
	$("#project-container img").each(function (index) {
		$(this).hover(function() {
			$("#project-description div").css("opacity", 0);
			$("#project-description div").eq(index).css("opacity", 1);
		});
	});
});
