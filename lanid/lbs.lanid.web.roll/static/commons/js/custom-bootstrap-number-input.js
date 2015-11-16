

//
//bootstrap-number-input
// Modified by Rolland to meet  customer's need
//



(function ( $ ) {

	$.fn.bootstrapNumber = function( options ) {

		var settings = $.extend({
			upClass: 'default',
			downClass: 'default',
			center: true
		}, options );


		var outputPrice = {single:null, couple:null,total:null};




		return this.each(function(e) {
			var self = $(this);
			var clone = self.clone();

			var min = self.attr('min');
			var max = self.attr('max');

			function setText(n) {
				if((min && n < min) || (max && n > max)) {
					return false;
				}
				clone.focus().val(n);
				return true;
			}

			var specialValidationElem = $('#customMartonFormFeesLabel')[0];
			var group = $("<div class='input-group'></div>");
			var down = $("<button type='button'>-</button>").attr('class', 'btn btn-' + settings.downClass).click(function() {

				var newVal = parseInt(clone.val()) - 1;

				setText(newVal);

				updateValues(newVal,this);

				if(parseInt(clone.val())<1){
					down.addClass('disabled');
				}

				if(specialValidationElem.getAttribute('data-special-verification')==='false'){

					specialValidationElem.setAttribute('data-special-verification','true');
					lbs.util.validateRequiredSpecialFieds(null,specialValidationElem);
				}


			});
			var up = $("<button type='button'>+</button>").attr('class', 'btn btn-' + settings.upClass).click(function() {

				var newVal = parseInt(clone.val()) + 1;

				setText(newVal);

				updateValues(newVal,this);

				if(parseInt(clone.val())>0){
					down.removeClass('disabled');
				}

				if(specialValidationElem.getAttribute('data-special-verification')==='false'){

					specialValidationElem.setAttribute('data-special-verification','true');
					lbs.util.validateRequiredSpecialFieds(null,specialValidationElem);
				}

			});


			$("<span class='input-group-btn'></span>").append(down).appendTo(group);
			clone.appendTo(group);
			if(clone) {
				clone.css('text-align', 'center');
			}
			$("<span class='input-group-btn'></span>").append(up).appendTo(group);
			// remove spins from original
			clone.prop('type', 'text').keydown(function (e) {
				if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
					(e.keyCode == 65 && e.ctrlKey === true) ||
					(e.keyCode >= 35 && e.keyCode <= 39)) {
					return;
				}
				if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
					e.preventDefault();
				}

				var c = String.fromCharCode(e.which);
				var n = parseInt(clone.val() + c);

				if((min && n < min) || (max && n > max)) {
					e.preventDefault();
				}
			});

			self.replaceWith(group);

			var timerID = setTimeout(function(){  //this timeout is to give breathing time to the binder


				console.log('specialValidationElem',clone.val(),$('#customMartonFormFeesLabel'));

					if(parseInt(clone.val())<1){
						down.addClass('disabled');
					}
					else{
						specialValidationElem.setAttribute('data-special-verification','true');
					}

				 window.clearTimeout(timerID)

				},500);

			var updateValues = function (n,target){


				$('#singlePaymentInput, #couplePaymentInput').each(function(){
					this.setAttribute("readonly",'');
				});



				if($(target).parents('#singlePayment')[0]){
					outputPrice.single = n;
					console.log('single payment',outputPrice.single );
					$('#singlePaymentNumber').text(n);

					$('#singlePaymentInput').change();
				}
				else if($(target).parents('#couplePayment')[0]){

					outputPrice.couple = n;
					console.log('couple payment',outputPrice.couple);

					$('#couplePaymentNumber').text(n);

					$('#couplePaymentInput').change();
				}

				var singlePayPrice = null;
				var couplePayPrice = null;

				if(lbs.processes&&lbs.processes.activities&&lbs.processes.activities.application&&lbs.processes.activities.application.singlePayPrice){
					singlePayPrice = lbs.processes.activities.application.singlePayPrice;
				}
				if(lbs.processes&&lbs.processes.activities&&lbs.processes.activities.application&&lbs.processes.activities.application.couplePayPrice){
					couplePayPrice = lbs.processes.activities.application.couplePayPrice;
				}


				var singlePayTemp = parseInt($('#singlePaymentInput').val());
				var couplePayTemp = parseInt($('#couplePaymentInput').val());

				var totalTemp = singlePayTemp+couplePayTemp;

                outputPrice.total = singlePayTemp*singlePayPrice + couplePayTemp*couplePayPrice;

				$('#totalPaymentFee').find('span').text(outputPrice.total);
				$('#totalPaymentFee').find('input').val(outputPrice.total);



				var updateAmountTimerID = setTimeout(function(){  //todo: this is persist the amount for the mathon activity. persisting both the singlepay/couple and the total amount from the custom-bootstrap-number was failling because it was too fast for the backend persist!!!!!!

					$('#totalPaymentFee').find('input').change();

					window.clearTimeout(updateAmountTimerID)

				},300);

			}

			$('#singlePaymentInput, #couplePaymentInput').click(function(){
				this.removeAttribute("readonly");
			});
        });

	};
} ( jQuery ));

