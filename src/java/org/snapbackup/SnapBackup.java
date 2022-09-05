////////////////////////////////////////////////////////////////////////////////
// Snap Backup                                                                //
// SnapBackup.java                                                            //
//                                                                            //
// Main Startup:                                                              //
//    This object launches the command line or GUI version of appliction.     //
//                                                                            //
// GPLv3 -- snapback.org/license -- Copyright (c) individual contributors     //
////////////////////////////////////////////////////////////////////////////////

package org.snapbackup;

import javax.swing.JOptionPane;
import javax.swing.UIManager;
import org.snapbackup.business.DataModel;
import org.snapbackup.ui.Application;
import org.snapbackup.ui.UIProperties;
import org.snapbackup.settings.AppProperties;
import org.snapbackup.settings.UserPreferences;

public abstract class SnapBackup {

   // Run Snap Backup in either command line mode where the parameter is the profile name
   // or in GUI (Swing) mode if there are no parameters.
   public static void main(String[] args) {
      if (args.length == 0) {
         AppProperties.addSupplimentalProperty(DataModel.prefSkinName,
            UIManager.getSystemLookAndFeelClassName());  //make system l&f the default
         try {
            UIManager.setLookAndFeel(UserPreferences.readPref(DataModel.prefSkinName));
            }
         catch (Exception e) {
            JOptionPane.showMessageDialog(null, e.getMessage(),
               UIProperties.skinErrMsg, JOptionPane.ERROR_MESSAGE);
            UserPreferences.deletePref(DataModel.prefSkinName);
            }
         new Application();
         }
      else if ("--list".equalsIgnoreCase(args[0]))
         DataModel.doCmdLineList();
      else
         DataModel.doCmdLineBackup(args[0], args.length > 1 ? args[1] : null);
      }

}
