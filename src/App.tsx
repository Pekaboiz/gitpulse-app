import "./styles/reset.css"
import "./styles/global.css"
import { ActiveTabProvider } from "./features/git/hooks/ActiveTabContext";
import AppLayout from "./app/AppLayout";
import { LoadingProvider } from "./features/git/hooks/LoaderStates";

function App() {
  
  return (
    <LoadingProvider>
      <ActiveTabProvider>
          <AppLayout/>
      </ActiveTabProvider>
    </LoadingProvider>

  );
}

export default App;
