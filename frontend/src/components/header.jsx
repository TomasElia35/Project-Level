<AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
                    <Toolbar variant="dense">
                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
                            Portal Hergo
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />}
                            label={<Chip label={isAdmin ? "ADMIN" : "USUARIO"} color={isAdmin ? "error" : "primary"} size="small" variant={isAdmin ? "filled" : "outlined"} />}
                        />
                    </Toolbar>
                </AppBar>