var map;

function initMap() {
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 49.487457, lng: 8.466040},
        zoom: 6
    });
    var requestedURL = new URL (window.location.href);
    var requestedStation = requestedURL.searchParams.get("stadt");
    var requestedDate = requestedURL.searchParams.get("datum");
    document.getElementById("city-input").value = requestedStation;
    //Das Datum muss in einem Format übergeben werden, dass von Date.parse() akzeptiert wird, z.B. 2019-07-20T15:00:00
    var date = new Date();
    try {
        date = new Date (requestedDate);
    } catch (err) {
        console.log(err);
    }
    requestedDate = date;
    formattedDate = requestedDate.toLocaleDateString("en-US", { year: 'numeric', month: 'numeric', day: 'numeric' });
    document.getElementById("date-input").value = formattedDate;
    $.ajax({
        //url: "http://localhost:8080/api/test2/largeCities",
        url : "http://localhost:8080/api/getPrice/"+ requestedStation + "/" + requestedDate,
        success: function (locationData) {
            var marker;
            //Array nach Eigenschaft sortieren, um Ranking zu repräsentieren
            locationData.sort(function(a, b){return a.ranking - b.ranking});
            for (var i = 0; i < locationData.length; i++) {
                console.log(locationData[i]);

                var lat = locationData[i].city.lat;
                var lng = locationData[i].city.lng;
                var city = locationData[i].city.city;
                
                var price = locationData[i].db_route.price.amount +"0 "+ locationData[i].db_route.price.currency;

                var geodata = {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                };
                var weatherID;
                var temperature;
                var forecast = locationData[i].weather_information.rows;
                //Welcher Wetterwert soll für die Karte verwertet werden? Hier wird erstmal der nächstbeste aus dem Array genommen, der nach dem angefragten Zeitpunkt liegt.
                for (var j = 0; j < forecast.length; j++){
                    weatherID = forecast[j].weather_id;
                    temperature = forecast[i].temperature /10;
                    var thatDate = new Date(forecast[j].dt_value.replace(/ /g, "T"));
                    if (thatDate > requestedDate) break;
                }

                var weatherIcon = "http://localhost:8080/api/getWeatherIcon/" + weatherID;
                var contentString = '<div id="content">' +
                    '<div id="siteNotice">' +
                    '</div>' +
                    '<h1 id="firstHeading" class="firstHeading"></h1>' +
                    '<div id="bodyContent">' +
                        '<p class="popup_info">' + city + '</p>' +
                    '<p>ab ' + price + '</p>' +
                        '<img src="'+ weatherIcon +'"></img>' +
                    '</div>' +
                    '</div>';
                //Getting names of all the images available
                var images = ["Dresden.jpg", "Koenigssee.jpg", "Nordsee.jpg", "Sandsteingebirge.jpg", "Schloss.jpg"];
                var cityPics = ["berlin.jpg", "dresden.jpg", "hamburg.jpg", "heidelberg.jpg", "kiel.jpg", "leipzig.jpg", "potsdam.jpg", "regensburg.jpg", "stralsund.jpg", "stuttgart.jpg"];
                if (cityPics.includes(city.toLowerCase()+".jpg") ){
                    imageOfCity = "Cities/"+city.toLowerCase()+".jpg";
                }else {
                    var imageOfCity = images[i%images.length];
                }
                //Replace the above with proper image selection
                var modalInnerHTML = '<tr> <td>'+ formattedDate +' </td> </tr> ' +
                                     '<tr> <td> <img class="weather-image" src="'+weatherIcon+'"/> <p> ' + Math.round(temperature) + ' Grad </p> </td> </tr>'+
                                     '<tr> <td> <button type="button" id="priceBtn'+i+'" class="btn login_btn" data-target="#myModal'+i+'" ata-toggle="modal">'+
                                        price +
                                     '</button> </td> </tr>';

                var sidebarHTMLitem = '<div id="resultcard'+i+'" class="card shadow-sm mb-5 bg-white rounded">'+
                        '<div class="row" id="row-card">'+
                            '<div class="col-6" id="col-card-img">' +
                            '<img class="card-img-left" src="../img/'+imageOfCity+'" />'+
                            '</div>'+
                            '<div class="col-6" id="col-card-text">'+
                                '<h5 class="card-title">'+city+'</h5>'+
                                '<p class="card-text">'+
                                    'Bahnfahren ist toll!'+
                                '</p>'+
                                '<button type="button" id="bookBtn' + i +'"class="btn login_btn" data-target="#myModal'+i+'" data-toggle="modal">'+
                                  'Buchen ab '+ price + 
                                '</button>'+
                                '<div class="modal fade" id="myModal'+i+'" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">'+
                                    '<div class="modal-dialog modal-dialog-centered" role="document">'+
                                        '<div class="modal-content">'+
                                            '<div class="modal-header">'+
                                                '<h5 class="modal-title" id="ModalLongTitle'+i+'">'+
                                                    requestedStation +' &#8594 '+ city+
                                                '</h5>'+
                                                '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                                                    '<span aria-hidden="true">&times;</span>'+
                                                '</button>'+
                                            '</div>'+
                                        '<div class="modal-body">'+
                                        //Modal Content
                                            '<div class="container-fluid">'+
                                                '<div class="row">'+
                                                    '<div> <img id="title-image'+i+'" class="title-image" src="../img/'+ imageOfCity +'" /> </div>'+
                                                '</div>'+
                                                '<div class="row justify-content-md-center">'+
                                                    '<div>'+
                                                        '<table class="table">'+
                                                            '<tbody>'+
                                                            //td und tr
                                                            modalInnerHTML +
                                                            '</tbody>'+
                                                        '</table>'+
                                                    '</div>'+
                                                '</div>'
                                            '</div>'
                                        //Modal Content End
                                        '</div>'+
                                    '</div>'+
                                '</div>'+
                          '</div>'+
                        '</div>'+
                    '</div>';
                var div = document.createElement('div');
                div.innerHTML =  sidebarHTMLitem;
                document.getElementById("left-col-travelsuggestions").appendChild(div.firstChild);
                var infowindow = new google.maps.InfoWindow({
                    content: contentString
                });

                marker = new google.maps.Marker({
                    position: geodata,
                    map: map,
                    title: city,
                })

                infowindow.open(map, marker);
                google.maps.event.addListener(marker, 'click', (function (marker, contentString, infowindow) {
                    return function () {
                        infowindow.setContent(contentString);
                        infowindow.open(map, marker);
                    };
                })(marker, contentString, infowindow));
            }
        }
    });
}