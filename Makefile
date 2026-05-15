APP_ID   = org.oted.idlegif
VERSION  = $(shell node -p "require('./appinfo.json').version")
IPK      = $(APP_ID)_$(VERSION)_all.ipk
DEVICE   = tv

.PHONY: all package install apply uninstall launch update clean test

all: update

package:
	@echo "Packaging $(APP_ID) v$(VERSION)..."
	@ares-package . \
		-e ".git" \
		-e ".env" \
		-e "*.ipk" \
		-e "Makefile" \
		-e "AGENTS.md" \
		-e "store-description.md" \
		-e "org.oted.idlegif.yml" \
		-e "test" \
		-e "default.gif" \
		-e "default1.gif" \
		-e "default2.gif" \
		-e "default3.gif" \
		-e "default4.gif" \
		-e "default_download.gif"
	@echo "Built: $(IPK)"

install: package
	@echo "Installing to device '$(DEVICE)'..."
	@ares-install -d $(DEVICE) $(IPK)

apply:
	@echo "Applying screensaver override on '$(DEVICE)'..."
	@ares-shell -d $(DEVICE) -r "sh /media/developer/apps/usr/palm/applications/org.oted.idlegif/assets/install.sh"

uninstall:
	@echo "Removing screensaver override on '$(DEVICE)'..."
	@ares-shell -d $(DEVICE) -r "sh /media/developer/apps/usr/palm/applications/org.oted.idlegif/assets/uninstall.sh"

launch:
	@echo "Launching $(APP_ID) on '$(DEVICE)'..."
	@ares-launch -d $(DEVICE) $(APP_ID)

update: install apply launch

test:
	@echo "Navigating to home, then triggering screensaver..."
	@ares-launch -d $(DEVICE) com.webos.app.home
	@sleep 3
	@ares-shell -d $(DEVICE) -r "luna-send -n 1 luna://com.webos.service.tvpower/power/turnOnScreenSaver '{}'"

clean:
	@rm -f *.ipk

inspect:
	@ares-inspect -d $(DEVICE) -o $(APP_ID)
