import "./styles/reset.css"
import "./styles/global.css"
import { ActiveTabProvider } from "./features/git/hooks/ActiveTabContext";
import AppLayout from "./app/AppLayout";

function App() {
  
  return (
    <ActiveTabProvider>
      <AppLayout/>
    </ActiveTabProvider>

  );
}

export default App;
