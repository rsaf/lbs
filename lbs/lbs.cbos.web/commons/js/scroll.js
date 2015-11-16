
$(document).ready(function(){




function scrollToAnchor(aid){

	var screenwidth=$(window).width();
	console.log(screenwidth);

	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});

  //
	//if (screenwidth <= 480)
	//{
	//	console.log('1')
	//$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
  //
	//}
	//else if(screenwidth < 640 && screenwidth >= 481)
	//{ console.log('2')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
	//}
	//else if(screenwidth < 768 && screenwidth >= 640)
	//{ console.log('3')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
	//}
	//else if(screenwidth < 1000 && screenwidth >= 768)
	//{ console.log('4')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
	//}
	//else if(screenwidth < 1100 && screenwidth >= 1000)
	//{ console.log('5')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
	//}
	//else if(screenwidth < 1200 && screenwidth >= 1100)
	//{ console.log('6')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
	//}
	//else if(screenwidth >= 1200)
	//{
	//	console.log('7')
	//	$(window).scrollTo('.'+aid,{duration:'slow', over : "-.05"});
  // 	}
	//
  //console.log(aid)
  //   var aTag = $("a[name='"+ aid +"']");
  //   $('html,body').animate({scrollTop: aTag.offset().top},'slow');
	//
	//


}

$(".arrow-motion").on('click', function(e) {
	e.preventDefault();
	var target = this.getAttribute('data-id');

   scrollToAnchor(target);
});

});
