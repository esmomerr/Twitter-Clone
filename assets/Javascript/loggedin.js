async function control(){
    const { data } = _supabase.auth.onAuthStateChange((event, session) => {
        if((event === 'SIGNED_IN')){
            window.location.href = "/index.html"
        }
    })     
}

control();