// $('#pagination-demo').twbsPagination({
//     totalPages: 35,
//     visiblePages: 7,
//     onPageClick: function (event, page) {
//       $('#page-content').text('Page ' + page);
//     }
//   });




    




$('.ppr-slide').slick({
  infinite: false,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
  speed: 1500,
    prevArrow: '#pp-left',
    nextArrow: '#pp-right'

});


$('.mid-enrol-slide').slick({
  dots: true,
  infinite: false,
  speed: 300,
  slidesToShow: 1,
  slidesToScroll: 1,
  responsive: [
    {
      breakpoint: 1024,
      settings: {
        slidesToShow:1,
        slidesToScroll:1,
        infinite: true,
        dots: true
      }
    },
   
  ]
});
// $("#toggle").click(function() {
//   $("#cours-tt").toggle();
// });


document.addEventListener('DOMContentLoaded', function () {
  const radioButtons = document.querySelectorAll('input[name="option"]');
  const divs = document.querySelectorAll('div[id^="div"]');

  radioButtons.forEach(radio => {
    radio.addEventListener('change', function () {
      divs.forEach(div => div.style.display = 'none');
      document.getElementById(`div${this.value.slice(-1)}`).style.display = 'block';
    });
  });
});