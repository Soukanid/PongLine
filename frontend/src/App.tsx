const callBackend = async () => {
  
  const response = await fetch('http://localhost:8080/api/auth/test');
  const data = await response.json();
  console.log(data);
  alert(data.message);
}

export default function App() {
  return <button onClick={callBackend}>Test Connection</button>;
}
