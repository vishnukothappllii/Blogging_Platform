import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App"
import { ThemeProvider } from "./contexts/ThemeContext"
import { AuthProvider } from "./contexts/AuthContext"
import { CommentProvider } from "./contexts/CommentContext"
import { LikeProvider } from "./contexts/LikeContext"
import { FollowerProvider } from "./contexts/FollowerContext"
import { PostProvider } from "./contexts/PostContext"
import { Toaster } from "./components/ui/use-toast"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <LikeProvider>
            <FollowerProvider>
              <CommentProvider>
                <PostProvider>
                  <App />
                  <Toaster />
                </PostProvider>
              </CommentProvider>
            </FollowerProvider>
          </LikeProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
