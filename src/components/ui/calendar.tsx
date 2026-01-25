"use client"

import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

function Calendar({
	classNames,
	...props
}: React.ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			classNames={{
				root: cn(
					"relative size-fit select-none rounded-md border p-3 shadow-xs",
					props.className
				),
				month: cn("m-0 space-y-1 text-center", classNames?.month),
				month_caption: cn(
					"flex h-8 items-center justify-center text-sm font-medium",
					classNames?.month_caption
				),
				today: cn("bg-purple-50 text-[#7f2dfb] font-bold rounded-md", classNames?.today),
				week: cn("flex justify-center py-0.5", classNames?.week),
				day: cn(
					"flex size-8 items-center justify-center rounded-md text-sm font-normal transition-colors hover:bg-purple-50 hover:text-[#7f2dfb] focus:bg-purple-50 focus:text-[#7f2dfb] focus:outline-none",
					classNames?.day
				),
				day_button: cn(
					"size-8 rounded-md focus:outline-hidden focus-visible:outline-[3px] focus-visible:outline-offset-1",
					classNames?.day_button
				),
				weekdays: cn("flex justify-center", classNames?.weekdays),
				weekday: cn(
					"size-8 text-sm font-normal text-muted-foreground",
					classNames?.weekday
				),
				outside: cn(
					"text-muted-foreground/80 hover:text-muted-foreground/80! opacity-50",
					classNames?.outside
				),
				selected: cn(
					"bg-[#7f2dfb]! text-white! hover:bg-[#6b24d6]! focus:bg-[#6b24d6]!",
					classNames?.selected
				),
				range_middle: cn(
					"bg-purple-50! text-[#7f2dfb]! rounded-none first:rounded-l-md last:rounded-r-md hover:bg-purple-100! hover:text-[#7f2dfb]!",
					classNames?.range_middle
				),
				range_start: cn(
					props.mode === "range" &&
						props.selected?.from?.getTime() !== props.selected?.to?.getTime()
						? "not-last:rounded-r-none bg-purple-50! [&>button]:bg-[#7f2dfb]! [&>button]:text-white!"
						: "",
					classNames?.range_start
				),
				range_end: cn(
					props.mode === "range" &&
						props.selected?.from?.getTime() !== props.selected?.to?.getTime()
						? "not-first:rounded-l-none bg-purple-50! [&>button]:bg-[#7f2dfb]! [&>button]:text-white!"
						: "",
					classNames?.range_end
				),
				disabled: cn(
					"pointer-events-none text-muted-foreground opacity-50",
					classNames?.disabled
				),
				hidden: cn("pointer-events-none", classNames?.hidden),
				nav: cn("", classNames?.nav),
				month_grid: cn("", classNames?.month_grid),
			}}
			components={{
				NextMonthButton: (props) => (
					<button
						{...props}
						className={cn(
							"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
							"absolute right-3",
							classNames?.button_next
						)}
					>
						<ChevronRightIcon className="size-4" />
					</button>
				),
				PreviousMonthButton: (props) => (
					<button
						{...props}
						className={cn(
							"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
							"absolute left-3",
							classNames?.button_previous
						)}
					>
						<ChevronLeftIcon className="size-4" />
					</button>
				),
			}}
			{...props}
		/>
	)
}

export { Calendar }
