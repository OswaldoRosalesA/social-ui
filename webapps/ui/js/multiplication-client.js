const multiplicationHost = "http://localhost:8000";

function updateMultiplication() {
    $.ajax({
        url: multiplicationHost + "/multiplications/random"
    }).then(function (data) {
        // Cleans the form
        $("#attempt-form").find("input[name='result-attempt']").val("");
        $("#attempt-form").find("input[name='user-alias']").val("");
        // Gets a random challenge from API and loads the data in the HTML
        $('.multiplication-a').empty().append(data.factorA);
        $('.multiplication-b').empty().append(data.factorB);
    });
}

function updateResults(alias) {
    let userId = -1;
    $.ajax({
        async: false,
        url: multiplicationHost + "/results?alias=" + alias,
        success: function (data) {
            $('#results-div').show();
            $('#results-body').empty();
            data.forEach(function (row) {
                $('#results-body').append('<tr><td>' + row.id + '</td>' +
                    '<td>' + row.multiplication.factorA + ' x ' + row.multiplication.factorB + '</td>' +
                    '<td>' + row.resultAttempt + '</td>' +
                    '<td>' + (row.correct === true ? 'YES' : 'NO') + '</td></tr>');
            });
            userId = data[0].user.id;
        }
    });
    return userId;
}

$(document).ready(function () {

    updateMultiplication();

    $("#attempt-form").submit(function (event) {

        // Don't submit the form normally
        event.preventDefault();

        // Get some values from elements on the page
        let a = $('.multiplication-a').text();
        let b = $('.multiplication-b').text();
        let $form = $(this),
            attempt = $form.find("input[name='result-attempt']").val(),
            userAlias = $form.find("input[name='user-alias']").val();

        // Compose the data in the format that the API is expecting
        let data = {user: {alias: userAlias}, multiplication: {factorA: a, factorB: b}, resultAttempt: attempt};

        // Send the data using post
        $.ajax({
            url: multiplicationHost + '/results',
            type: 'POST',
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: false,
            success: function (result) {
                if (result.correct) {
                    $('.result-message').empty()
                        .append("<p class='bg-success text-center'>The result is correct! Congratulations!</p>");
                } else {
                    $('.result-message').empty()
                        .append("<p class='bg-danger text-center'>Oops that's not correct! But keep trying!</p>");
                }
            }
        });

        updateMultiplication();

        setTimeout(function () {
            let userId = updateResults(userAlias);
            updateStats(userId);
            updateLeaderBoard();
        }, 300);

    });
});