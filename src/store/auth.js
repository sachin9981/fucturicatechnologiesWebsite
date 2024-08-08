import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    user : localStorage.getItem('name') || null,
    token : localStorage.getItem('token') || null,
    isAuthenticated : !!localStorage.getItem('token'),
    role : localStorage.getItem('role') || null,
    userId : localStorage.getItem('userId') || null
};

const authSlice = createSlice({
    name : 'auth',
    initialState,
    reducers : {
        login(state, action) {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            state.role = action.payload.user.role;
            state.userId = action.payload.user.userId;
            localStorage.setItem('role', action.payload.user.role)
            localStorage.setItem('name', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('userId', action.payload.user.userId);
        },
        logout(state) {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            state.role= null;
            state.userId = null;
            localStorage.removeItem('user');
            localStorage.removeItem('token')
            localStorage.removeItem('role')
            localStorage.removeItem('userId')
        },
        },
    
});

export const {login, logout} = authSlice.actions;
export default authSlice.reducer;