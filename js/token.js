var token;
function addToken(){
$.ajaxSetup({
headers: {
  "Authorization": "Bearer Access_Token " + token
}
});
};
