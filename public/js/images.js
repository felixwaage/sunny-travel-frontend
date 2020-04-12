var images = ["Sandsteingebirge.jpg", "Schloss.jpg", "Dresden.jpg", "Nordsee.jpg", "Koenigssee.jpg"];
$(function () {
    var i = 0;
    $("#dvImage").css("background-image", "url(img/" + images[i] + ")");
    setInterval(function () {
        i++;
        if (i == images.length) {
            i = 0;
        }
        $("#dvImage").fadeOut("slow", function () {
            $(this).css("background-image", "url(img/" + images[i] + ")");
            $(this).fadeIn("slow");
        });
    }, 4000);
});