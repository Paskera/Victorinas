export const getLocalIP = async (): Promise<string> => {
    try {
      const response = await fetch('http://localhost:8000/local-ip')
      const data = await response.json()
      return data.ip
    } catch (error) {
      return 'localhost'
    }
  }
  
  export const getServerUrl = (ip: string = 'localhost'): string => {
    return ip === 'localhost' ? 'http://localhost:3000' : `http://${ip}:3000`
  }
  
  export const getWebSocketUrl = (ip: string = 'localhost'): string => {
    return ip === 'localhost' ? 'ws://localhost:8000' : `ws://${ip}:8000`
  }