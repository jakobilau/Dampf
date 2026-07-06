export function SocketProvider({ children }) {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!user) return;

        const newSocket = io(window.location.origin, {
            withCredentials: true,
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("🟢 SOCKET CONNECTED:", newSocket.id);
            newSocket.emit("register", user.user_id);
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
            setSocket(null);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
}