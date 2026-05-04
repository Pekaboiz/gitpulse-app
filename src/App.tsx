// import "./App.css";
import "./styles/reset.css"
import "./styles/global.css"
import AppLayout from "./app/appLayout";
import { ActiveTabProvider } from "./features/git/hooks/ActiveTabContext";

function App() {
  
  return (
    <ActiveTabProvider>
      <AppLayout/>
    </ActiveTabProvider>

  );
}

export default App;
