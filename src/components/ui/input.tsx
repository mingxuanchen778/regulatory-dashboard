/**
 * Input 组件
 * 
 * 基于 shadcn/ui 风格的输入框组件
 * 用于搜索框和表单输入
 * 支持所有原生 input 属性和自定义样式
 */

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Input 组件属性接口
 * 继承所有原生 input HTML 属性
 */
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

/**
 * Input 组件
 * 
 * 特性：
 * - 支持所有原生 input 属性
 * - 可通过 className 自定义样式
 * - 使用 forwardRef 支持 ref 传递
 * - 默认样式符合 shadcn/ui 设计规范
 * 
 * @example
 * ```tsx
 * <Input 
 *   type="text" 
 *   placeholder="Search..." 
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 * />
 * ```
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // 基础样式
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
          // 文字样式
          "text-sm",
          // 占位符样式
          "placeholder:text-muted-foreground",
          // 焦点样式
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          // 禁用样式
          "disabled:cursor-not-allowed disabled:opacity-50",
          // 自定义样式
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

// 设置组件显示名称（用于 React DevTools）
Input.displayName = "Input";

export { Input };

