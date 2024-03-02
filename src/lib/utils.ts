import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * クラス名を動的に結合し、Tailwind CSS のクラスをマージする関数。
 * @example
 * // 基本的な使用例:
 * cn('bg-blue-500', 'text-white')
 * // 結果: 'bg-blue-500 text-white'
 *
 * // 条件付きのクラス:
 * cn('bg-blue-500', { 'text-white': true, 'text-red-500': false })
 * // 結果: 'bg-blue-500 text-white'
 *
 * // 重複したクラスのマージ:
 * cn('bg-blue-500', 'bg-red-500')
 * // 結果: 'bg-red-500' (bg-red-500 が bg-blue-500 を上書き)
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}
