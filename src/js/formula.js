const formula = {
    button_actions: {},
    radio_actions: {},
    autoassign: () => {
        $("multiselect").addClass("f-option f-style-multi")
        $("radioselect").addClass("f-option f-style-radio")
        $("*[hide]").prop('hide', false).css("display", "none");
        $("*[disable]").prop('disable', false).addClass("f-tag-disabled");
        $("*[optional]").prop("optional", false).addClass("f-tag-optional");
        $("*[require]").prop("require", false).addClass("f-tag-required");
        $("*[oneway]").prop("oneway", false).addClass("f-tag-oneway");
        $("*[select]").prop("select", false).addClass("f-tag-selected");
        $("*[extra-fill]").prop("extra-fill", false).addClass("f-extra-fill");
        $("*[extra-flip]").prop("extra-flip", false).addClass("f-extra-flip");
        $("*[collapse]").prop("collapse", false).addClass("f-collapse");
        $("*[collapsed]").prop("collapsed", false).addClass("f-tag-collapsed");
        $("*[trigger]").prop("trigger", false).addClass("f-part-trigger");
        $("*[content]").prop("content", false).addClass("f-part-content");
        $("*[fref]").each((index, element) => {
            const $element = $(element);
            $element.on("click", () => {
                window.location.href = $element.attr("fref");
            })
        });
        $("[link-github-repo]").each((index, element) => {
            const $element = $(element);
            $element.attr("href", "https://github.com/" + $element.text());
        });
        formula.reindex_static();
    },
    reindex_static: () =>{
        $("button").addClass("f-button")
        $("input[type='submit']").addClass("f-button")
        $("input[type='button']").addClass("f-button")
        $("input[type='text']").addClass("f-input")
        $("input[type='number']").addClass("f-input")
        $("input[type='password']").addClass("f-input")
        $("table").addClass("f-table")
        $("th").addClass("f-part-th")
        $("td").addClass("f-part-td")
        $("tr").addClass("f-part-tr")
    },
    init: () => {
        const storeScroll = () => {
            document.documentElement.dataset.scroll = window.scrollY;
        };
        document.addEventListener('scroll', storeScroll);
        storeScroll();
        $(".f-option.f-style-multi").on("click", function () {
            self = $(this);
            if (!self.hasClass("f-tag-disabled")) {
                if (!self.hasClass("f-tag-oneway") || !self.hasClass("f-tag-selected"))
                    self.toggleClass("f-tag-selected");
            }
        })
        $(".f-header.f-part-menu").on("click", function () {
            self = $(this);
            $(".f-floatingmenu").toggleClass("f-tag-shown");
        })
        $(".f-option.f-style-radio").on("click", function () {
            self = $(this);
            if (!self.hasClass("f-tag-disabled")) {
                var issel = self.hasClass("f-tag-selected");
                $(".f-option[name='" + self.attr("name") + "']").removeClass("f-tag-selected")
                if (!self.hasClass("f-tag-optional") || !issel) {
                    self.addClass("f-tag-selected");
                }
            }
        })
        $(".f-button").on("click", function () {
            self = $(this);
            if (!self.hasClass("f-tag-disabled")) {
                formula.button_actions[self.attr("name")](self)
            }
        })
        $(".f-collapse>.f-part-trigger").on("click", function () {
            self = $(this);
            parent = self.parent(".f-collapse");
            parent.toggleClass("f-tag-collapsed")
        })
        $("body").on("scroll", () => {
            console.log("0")
        })
    },
    registerButtonAction: (nm, handler) => {
        formula.button_actions[nm] = handler;
    },
    registerRadioAction: (nm, handler) => {
        formula.radio_actions[nm] = handler;
    },
    getOptionValue: (nm) => {
        elm = $(".f-option[name='" + nm + "']");
        if (elm.hasClass("multi")) {
            return elm.hasClass("f-tag-selected");
        } else {
            return $(".f-option.f-tag-selected[name='" + nm + "']").attr("value") || null;
        }
    },
    disable: (jq) => {
        jq.addClass("f-tag-disabled")
    },
    enable: (jq) => {
        jq.removeClass("f-tag-disabled")
    },
    toggleDisabled: (jq) => {
        jq.toggleClass("f-tag-disabled")
    },
    select: (jq) => {
        jq.addClass("f-tag-selected")
    },
    unselect: (jq) => {
        jq.removeClass("f-tag-selected")
    },
    toggleSelected: (jq) => {
        jq.toggleClass("f-tag-selected")
    }
}