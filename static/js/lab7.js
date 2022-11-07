fetch('http://127.0.0.1:5000/api/suggestions/')
    .then(response => response.json())
    .then(users => {
        console.log(users);
    });