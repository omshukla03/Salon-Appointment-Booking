package com.shukla.controller;

import com.shukla.model.Category;
import com.shukla.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping("/salon/{id}")
    public ResponseEntity<Set<Category>> getCategoriesBySalon(
            @PathVariable Long id
    ){
        Set<Category> categories=categoryService.getAllCategoryBySalon(id);
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/{id}")
    public ResponseEntity <Category> getCategoriesById(
            @PathVariable Long id
    )throws Exception{
        Category category=categoryService.getCategoryById(id);
        return ResponseEntity.ok(category);
    }
}
