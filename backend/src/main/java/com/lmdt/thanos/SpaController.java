package com.lmdt.thanos;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {

    // Home
    @GetMapping("/")
    public String index() {
        return "forward:/index.html";
    }

    // Rutas de la SPA (añade aquí las que tengas en el Router)
    @GetMapping({ "/admin", "/phase1", "/phase2" })
    public String anySpaRoute() {
        return "forward:/index.html";
    }
}
