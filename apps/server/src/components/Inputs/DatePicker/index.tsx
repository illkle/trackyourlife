import { RefObject, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@shad/lib/utils";
import {
  addMonths,
  clamp,
  format,
  getDaysInMonth,
  getISODay,
  isAfter,
  isBefore,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
  XIcon,
} from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import { useResizeObserver } from "usehooks-ts";

import { Button, buttonVariants } from "~/@shad/components/button";
import { DrawerMobileTitleContext } from "~/@shad/components/drawer";
import {
  DynamicModal,
  DynamicModalContent,
  DynamicModalDescription,
  DynamicModalDrawerTitle,
  DynamicModalTrigger,
} from "~/components/Modal/dynamicModal";

const DatePicker = ({
  date,
  onChange,
  className,
  limits = {
    start: new Date(2000, 0, 1),
    end: new Date(2040, 0, 1),
  },
  disableClear = false,
}: {
  date: Date | undefined;
  onChange: (d?: Date) => void;
  limits: {
    start: Date;
    end: Date;
  };
  className?: string;
  disableClear?: boolean;
}) => {
  const dateNow = new Date();

  const calRef = useRef<HTMLDivElement>(null);
  const [isOpened, setIsOpened] = useState(false);

  const [cursor, setCursor] = useState(() => startOfMonth(date ?? dateNow));

  const wrapRef = useRef<HTMLDivElement>(null);

  const { height } = useResizeObserver({
    ref: wrapRef as RefObject<HTMLDivElement>,
  });

  const toRender = getDaysInMonth(cursor);
  const dates = Array(toRender)
    .fill(0)
    .map((_, i) => i + 1);

  const firstDayDate = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const prefaceWith = getISODay(firstDayDate) - 1;
  const prepend = Array(prefaceWith).fill(0);

  const [moveDirection, setMoveDirection] = useState(0);

  const moveCursorMonths = (n: number) => {
    const newDate = clamp(addMonths(cursor, n), limits);
    setCursor(newDate);
    setMoveDirection(n < 0 ? -1 : 1);
  };

  const recordDate = (day: number) => {
    if (!inLimit(day)) return;
    const d = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    onChange(d);
    setIsOpened(false);
  };

  useEffect(() => {
    const closeChecker = (e: MouseEvent) => {
      if (e.target && calRef.current) {
        const t = e.target as Element;
        if (!calRef.current.contains(t)) {
          setIsOpened(false);
        }
      }
    };

    window.addEventListener("click", closeChecker);

    return () => {
      window.removeEventListener("click", closeChecker);
    };
  }, []);

  const inLimit = (day: number) => {
    const date = new Date(cursor.getFullYear(), cursor.getMonth(), day);
    if (isBefore(date, limits.start) || isAfter(date, limits.end)) return false;
    return true;
  };

  const highlightSelected = date && isSameMonth(date, cursor) ? date.getDate() : -1;

  const variants = {
    enter: (d = 0) => {
      return { x: `${100 * d}%`, opacity: 0 };
    },
    middle: () => {
      return { x: "0%", opacity: 1 };
    },
    exit: (d = 0) => {
      return { x: `${-100 * d}%`, opacity: 0 };
    },
  };

  const mobileTitle = useContext(DrawerMobileTitleContext);

  return (
    <div className={cn("relative flex", className)}>
      <DynamicModal open={isOpened} onOpenChange={setIsOpened} desktopMode="popover">
        <DynamicModalContent className="overflow-hidden">
          <div className="relative max-sm:m-auto max-sm:w-fit max-sm:pb-4">
            <DynamicModalDrawerTitle className="text-center">{mobileTitle}</DynamicModalDrawerTitle>
            <DynamicModalDescription> </DynamicModalDescription>
            <m.div
              animate={{ height: height }}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="flex w-full flex-col items-center md:w-fit"
            >
              <div ref={wrapRef}>
                <div className="flex w-full items-center justify-between py-2">
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSameMonth(limits.start, cursor)}
                      onClick={() => moveCursorMonths(-12)}
                    >
                      <ChevronsLeftIcon size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSameMonth(limits.start, cursor)}
                      onClick={() => moveCursorMonths(-1)}
                    >
                      <ChevronLeftIcon size={16} />
                    </Button>
                  </div>
                  <AnimatePresence mode="popLayout" initial={false} custom={moveDirection * 0.1}>
                    <m.div
                      initial="enter"
                      animate="middle"
                      exit="exit"
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                      variants={variants}
                      custom={moveDirection * 0.1}
                      key={cursor.toString()}
                      className="pointer-events-none whitespace-nowrap select-none"
                    >
                      {format(cursor, "MMMM yyyy")}
                    </m.div>
                  </AnimatePresence>
                  <div className="flex">
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSameMonth(dateNow, cursor)}
                      onClick={() => moveCursorMonths(1)}
                    >
                      <ChevronRightIcon size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSameMonth(dateNow, cursor)}
                      onClick={() => moveCursorMonths(12)}
                    >
                      <ChevronsRightIcon size={16} />
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="popLayout" initial={false} custom={moveDirection * 0.5}>
                  <m.div
                    initial="enter"
                    animate="middle"
                    exit="exit"
                    custom={moveDirection * 0.5}
                    className={"grid w-fit grid-cols-7 gap-1"}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    variants={variants}
                    key={cursor.toString()}
                  >
                    {prepend.map((_, i) => (
                      <div key={`${cursor.getMonth()}—prep—${i}`}></div>
                    ))}
                    {dates.map((el) => (
                      <Button
                        className="h-9 sm:w-9"
                        disabled={!inLimit(el)}
                        variant={el === highlightSelected ? "default" : "ghost"}
                        key={`${cursor.getMonth()}-${el}`}
                        onClick={() => recordDate(el)}
                      >
                        {el}
                      </Button>
                    ))}
                  </m.div>
                </AnimatePresence>
              </div>
            </m.div>
          </div>
        </DynamicModalContent>

        <DynamicModalTrigger>
          <div
            className={cn(
              buttonVariants({ variant: "outline" }),
              !disableClear && "rounded-r-none",
              "min-w-50",
            )}
          >
            <span className="">{date ? format(date, "d MMMM yyyy") : "No date set"}</span>
            <CalendarIcon size={16} className="ml-auto" />
          </div>
        </DynamicModalTrigger>
        {!disableClear && (
          <Button
            variant={"outline"}
            disabled={!date}
            size={"icon"}
            className="rounded-l-none border-l-0"
            onClick={() => onChange(undefined)}
          >
            <XIcon size={16} />
          </Button>
        )}
      </DynamicModal>
    </div>
  );
};

export default DatePicker;
