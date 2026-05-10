console.log("JS LOADED");
document.addEventListener("DOMContentLoaded", function() {
const loginForm = document.getElementById('loginForm');
const messageBox = document.getElementById('messageBox');

loginForm.addEventListener('submit', async function(event) {
    
   
    event.preventDefault(); 

   
    const userEmail = document.getElementById('email').value;
    const userPassword = document.getElementById('password').value;

    try {
       
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST', 
            headers: {
                
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
               
                email: userEmail,
                password: userPassword
            })
        });

        
        const data = await response.json();

       
        if (data.success === true) {

            localStorage.setItem("token", data.token);
            
            messageBox.innerHTML = "<p style='color: green;'>Login Successful! Welcome.</p>";
            if (data.user.role === "admin") {
    window.location.href = "Admin_Dashboard_UI.html";
} else {
    window.location.href = "exampageUI.html";
}
            
        } else {
            
            messageBox.innerHTML = "<p style='color: red;'>Invalid Credentials!.</p>";
        }

    } catch (error) {
        
        console.error("Error:", error);
        messageBox.innerHTML = "<p style='color: red;'>Backend se connect nahi ho paaya. Server check karo.</p>";
    }
});
});