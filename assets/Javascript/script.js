function qs(x){
  return document.querySelector(x) ?? document.createElement("span")
}

const SUPABASE_URL = "https://zwnkbpfegvwnnrkxtona.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3bmticGZlZ3Z3bm5ya3h0b25hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTUwMjkxMTcsImV4cCI6MjAzMDYwNTExN30.-r3QcwNhuJ5KdyjGEhT2QYNCCaeGZqevWzgvLmSfhQI"

const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const signOutBtn = qs(".signOutBtn");
signOutBtn.addEventListener("click", signOutUser);

const registerForm = qs(".register");
registerForm.addEventListener("submit", registerFormData);

const loginForm = qs(".logIn");
loginForm.addEventListener("submit", loginFormData);

const inputDiv = qs(".input-div")
inputDiv.addEventListener("submit", createData);

const post = qs(".post");
post.addEventListener("submit", addPost)

async function getData(tables){
    const { data, error } = await _supabase.from(tables).select()
    if(error){
        return error
    }
    return data
}

async function registerFormData(e){
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    console.log(formObj);

    const { data, error } = await _supabase.auth.signUp({
        email: formObj.email,
        password: formObj.password,
        options:{
          data:{
            username: formObj.username
          }
        }
    })
    if(error){
      Swal.fire({
        icon: "error",
        title: "HATA...",
        text: "Böyle Bir Kullanıcı Mevcut!",
        footer: '<a href="../../login.html">Giriş Yap</a>'
      });
    }else{
      console.log(data);
      Swal.fire({
        icon: "success",
        title: "Kayıt Başarılı Hoşgeldiniz",
        text: "Ana Sayfaya Yönlendiriliyorsunuz.",
        footer: ''
      });
    }
    registerForm.reset()
    console.log(data);
  }

async function loginFormData(e){
    e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    console.log(formObj);

    const { data, error } = await _supabase.auth.signInWithPassword({
        email: formObj.email,
        password: formObj.password,
      })
      loginForm.reset();

      if (error) {
        Swal.fire({
          icon: "error",
          title: "HATA...",
          text: "Böyle Bir Kullanıcı Yok!",
          footer: '<a href="../../register.html">Kayıt Ol</a>'
        });
      }else{
        console.log(data);
        Swal.fire({
          icon: "success",
          title: "Giriş Başarılı Hoşgeldiniz",
          text: "Ana Sayfaya Yönlendiriliyorsunuz.",
          footer: ''
        });
        window.location.href = "/index.html"
      }
}

async function signOutUser(e){
    e.preventDefault();
    const { error } = await _supabase.auth.signOut();
    console.log(error);
    window.location.href = "/login.html"
}

async function isAuth(){
  const { data, error } = await _supabase.auth.getSession();
  if(!error && data.session !== null){
    return data.session.user
  }else{
    window.location.href = "/login.html"
  }
}

async function createTemplate(){
  const data = await getData("comments");
  const commentss = document.querySelector(".post-container");
  commentss.innerHTML = " ";
  for (const comment of data) {
      commentss.innerHTML +=
      `
      <div class="post" data-commentid = "${comment.id}">
        <div class="like-control">
            <button class="like-left" id="${comment.id}"></button>
            <span name="like" class="like">${comment.like}</span>
            <button class="like-right" id="${comment.id}"></button>
        </div>
        <div>
            <header class="header">
                <div class="text">
                    <span class="user-name-span">${comment.user_name}</span>
                    <span class="date-span">${comment.created_at}</span>
                </div>
                <div class="delete">
                    <img src="../img/Shape.svg" alt="" class="deleteImg">
                    <span class="delete-span">DELETE</span>
                </div>
            </header>

            <div class="paragraph">
                <p class="comment-paragraph">${comment.comment}</p>
            </div>
        </div>
      </div>
      `
  }
  deleteComment();
  likeBtns();
  dislikeBtns();
  isAuth();
  // createPost();
}

async function createData(e){
  e.preventDefault();
  const formData = new FormData(e.target);
  const formObj = Object.fromEntries(formData);
  console.log(formObj);
    const user = await isAuth();
    console.log(user);
  const { data, error } = await _supabase.from('comments').insert([
      {
          user_name: user.user_metadata.username,
          comment: formObj.comment,
          like: 0
      }
  ]);
  createTemplate();
  inputDiv.reset();
  console.log(error);
}


async function deleteComment() {
  const deleteBtn = document.querySelectorAll(".deleteBtns");
  for (const dltBtn of deleteBtn) {
      dltBtn.addEventListener("click", async function(){
          const { error } = await _supabase.from('comments').delete().eq("id", Number(this.parentElement.parentElement.parentElement.parentElement.dataset.commentid));
          console.log(this.parentElement.parentElement.parentElement.parentElement.dataset.commentid);
          return createTemplate();
      })
  }
}

async function likeBtns(){
  const likeBtns = document.querySelectorAll(".like-left");
  for (const likeBtn of likeBtns) {
      likeBtn.addEventListener("click", async function(){
          const datas = await getData("comments");
          x = datas.find(d => d.id==this.id).like;
          x ++;
          const { data, error } = await _supabase
              .from('comments')
              .update({ like: x })
              .eq('id', Number(this.parentElement.parentElement.dataset.commentid));
              return createTemplate();
      })
  }
}

async function dislikeBtns(){
  const dislikeBtns = document.querySelectorAll(".like-right");
  for (const dislikeBtn of dislikeBtns) {
      dislikeBtn.addEventListener("click", async function(){
          const datas = await getData("comments");
          x = datas.find(d => d.id==this.id).like;
          x --;
          const { data, error } = await _supabase
          .from('comments')
          .update({ like: x })
          .eq('id', Number(this.parentElement.parentElement.dataset.commentid));
          return createTemplate();
      })
  }
}

async function addPost(e){
  e.preventDefault();
    const formData = new FormData(e.target);
    const formObj = Object.fromEntries(formData);
    console.log(formObj); 

    const user = await isAuth();
    console.log(user);

    const { data, error } = await _supabase
    .from('posts')
    .insert([{ post: formObj.post, user_id: user.id}])
    .select();
    console.log(data);
}

// async function createPost(){
//   const data = await getData("posts");
//   const postss = document.querySelector(".replies-container");
//   postss.innerHTML = " ";
//   for (const post of data) {
//       postss.innerHTML +=
//       `
//       <div class="replies" data-commentid = "${post.id}>
//         <div class="like-control">
//             <button class="like-left" id="${post.id}"></button>
//             <span name="like" class="like">${post.like}</span>
//             <button class="like-right" id="${post.id}"></button>
//         </div>
//         <div>
//             <header class="header">
//                 <div class="text">
//                     <span class="user-name-span">${post.user_name}</span>
//                     <span class="date-span">Date</span>
//                 </div>
//                 <div class="delete">
//                     <img src="assets/img/Shape.svg" alt="" class="deleteImg">
//                     <span class="delete-span">DELETE</span>
//                 </div>
//             </header>

//             <div class="paragraph">
//                 <p class="comment-paragraph">${post.post}</p>
//             </div>
//         </div>
//       </div>
//       `
//   }
// }

createTemplate();