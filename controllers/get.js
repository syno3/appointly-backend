import { supabase } from "../utils/supabaseClient.js";

export const testUser = async (req, res) => {
    
    let { data: Members, error } = await supabase
    .from('Members')
    .select('id')

    res.send(Members).status(200);
}

// sign in a user with their password
export const login = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const {user, error} = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    if(error){
        res.send(error).status(400);
    }

    res.send(user).status(200);
}

//sign up a user
export const signUp = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const {user, error} = await supabase.auth.signUp({
        email: email,
        password: password
    })
    if(error){
        res.send(error).status(400);
    }

    res.send(user).status(200);
}

//create a new meeting
