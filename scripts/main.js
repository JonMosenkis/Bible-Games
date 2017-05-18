$(document).ready(function () {

    //טעינה של נתונים מקובץ חיצוני
    $("#songBtn").click(function () {
        $("#myDiv h1").load("TextFile.txt");
    });


    //קבלה של נתונים באמצעות GET
    $("#getBtn").click(function () {
        $.get("Default.asp", function (data, status) {
            alert("Data: " + data + "\nStatus: " + status);
            console.log(status);

        });
    });

    //שליחה וקבלה של נתונים באמצעות POST
    $("#postBtn").click(function () {
        $.post("Default2.asp",
            {
                name:"Donald Duck",
                city:"Duckburg"
            },
            function(data,status){
                alert("Data: " + data + "\nStatus: " + status);
            });
        });
});
